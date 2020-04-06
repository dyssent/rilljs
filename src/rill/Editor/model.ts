import React, {
    useState, useEffect, useMemo
} from 'react';

import { rectsOverlap, Coords } from '../model/types';
import {
    Node,
    Graph,
    Design,
    Connection,
    createDefaultDesign,
    NodeDesign,
    ConnectionDesign,
    Rect,
    Port,
    ConnectionType,
    IOFlow,
    InputValue,
    OutputValue,
    createDefaultNodeDesign,
    newID,
    createDefaultConnectionDesign
} from '../model';
import {
    SelectNodes,
    SelectNodesCompressor,
    ActionType,
    ActionCompressor,
    PanViewCompressor,
    MoveNodes,
    MoveNodesCompressor,
    CreateNodes,
    PanView,
    ZoomView,
    ZoomViewCompressor,
    NodeOrder,
    ReorderNode,
    CreateConnection,
    UpdateConnection,
    DeleteNodes,
    DeleteConnections
} from './actions';
import { Options } from './options';

export interface ModelNodeState {
    node: Node;
    design: NodeDesign;
    selected?: boolean;
    invalid?: string;
}

export interface ModelConnectionState {
    connection: Connection;
    design: ConnectionDesign;
    selected?: boolean;
    invalid?: string;
}

export interface HistoryRecord {
    action: ActionType;
}

export interface HistoryState {
    records: HistoryRecord[];
    pointer: number;

    // TODO Add node beginUpdate transaction here,
    // so we can then commit it into a node action
    nodeEdit?: string;
}

export interface ActionResult<D = void> {
    success: boolean;
    data?: D;
    redraw?: boolean;
}

export type ModelView = {
    // Original objects
    graph: Graph;
    design: Design;

    // Nodes collections
    nodesOrder: string[];
    nodes: {[key: string]: ModelNodeState};
    nodesSelected: string[];

    // Connections
    connections: {[key: string]: ModelConnectionState};
    editingConnection?: {
        type: ConnectionType;
        isAnchorOut: boolean;
        reference?: string;     // Connection ID

        anchorPos: Coords;
        anchorPort: Port;

        targetPos: Coords;
        targetPort?: Port;
    };

    // Editor view
    history: HistoryState;
    pan: Coords;
    scale: number;

    // Inspect mode
    inspectMode: boolean;
    nodeHighlight?: string;
};

export interface ModelHooks {
    onPortsConnected: (connectionID: string, from: Port, to: Port) => void;
}

export type ModelActions = {
    undo: () => boolean;
    redo: () => boolean;

    do: <D = unknown>(action: ActionType) => D | undefined;

    // Editor View
    setInspectMode: (on: boolean) => void;
    highlightNode: (id?: string) => void;

    // Editor Actions
    pan: (coords: Coords) => void;
    zoom: (value: number, anchor?: Coords) => void;
    lookAtNode: (id: string) => void;

    reorderNode: (id: string, order: NodeOrder) => void;
    selectNodes: (id: string | string[], deselectSelection?: boolean, keepOrder?: boolean) => void;
    groupNodes: (ids: string[]) => void;
    ungroupNodes: (id: string) => void;

    beginConnectionEdit: (anchorPort: Port, anchorPos: Coords, reference?: string) => void;
    updateConnectionEditTarget: (targetPort: Port | undefined, targetPos: Coords) => void;
    finishConnectionEdit: () => void;
    cancelConnectionEdit: () => void;

    beginNodeEdit: (node: Node | string) => void;
    finishNodeEdit: () => void;
    cancelNodeEdit: () => void;

    // Nodes Actions
    createNode: (node: Node, pos?: Coords) => void;
    createNodes: (nodes: Array<{node: Node, pos?: Coords}>) => void;
    moveNode: (id: string, pos: Coords) => void;
    moveNodes: (nodes: Array<{id: string, pos: Coords}>) => void;
    shiftNode: (id: string, shift: Partial<Coords>) => void;
    shiftNodes: (nodes: Array<{id: string, shift: Partial<Coords>}>) => void;
    deleteNodes: (nodes: string[] | string) => void;

    // Connection Actions
    createConnection: (from: Port, to: Port, type: ConnectionType) => string;
    updateConnection: (id: string, from?: Port, to?: Port, disabled?: boolean) => void;
    deleteConnections: (connections: string[] | string) => void;

    // Helpers
    adjustForPanAndScale: (coords: Coords) => Coords;
    adjustForScale: (coords: Coords) => Coords;
    adjustForPan: (coords: Coords) => Coords;
    adjustPageCoords: (coords: Coords, noPan?: boolean, noScale?: boolean) => Coords;
    findNode: (id: string) => ModelNodeState | undefined;
    findNodesInRect: (rect: Rect) => ModelNodeState[];
    findNodes: (predicate: (n: ModelNodeState) => boolean) => ModelNodeState[];
    getSelectedNodes: () => ModelNodeState[];
    getOngoingConnection: () => {port: Port, type: ConnectionType} | undefined;
    findNodeAndPort: (port: Port) => {
        node: Node,
        flowIn?: IOFlow,
        flowOut?: IOFlow,
        valueIn?: InputValue,
        valueOut?: OutputValue
    } | undefined;
    findNodeFlowPort: (port: Port) => {
        node: Node,
        flowIn?: IOFlow,
        flowOut?: IOFlow
    } | undefined;
    findNodeValuePort: (port: Port) => {
        node: Node,
        valueIn?: InputValue,
        valueOut?: OutputValue
    } | undefined;
    findConnections: (predicate: (c: ModelConnectionState) => boolean) => ModelConnectionState[];
    isValidConnection: (fromPort: Port, toPort: Port) => boolean;
    redrawNode: (node: Node | string) => void;
    redrawConnection: (connection: Connection | string) => void;
    getZoom: () => number;
    getPan: () => Coords;
    getNewNodeID: () => string;
    getNewConnectionID: () => string;
}

export function getPerfectPan(g: Graph, d: Design): Coords {
    const nodes = g.getNodes();
    for (const n of nodes) {
        const nd = d.nodes[n.nodeID];
        if (!nd) {
            continue;
        }
        return {
            x: nd.x,
            y: nd.y
        };
    }

    return {
        x: 0,
        y: 0
    };
}

function buildDefaultState(
    graph: Graph,
    maybeDesign: Design | undefined,
    options: Options
): ModelView {
    const design = maybeDesign ? maybeDesign : createDefaultDesign(graph.getNodes());
    if (maybeDesign) {
        // Make sure we have all needed nodes in the design
        graph.getNodes().forEach(n => {
            if (!design.nodes[n.nodeID]) {
                design.nodes[n.nodeID] = createDefaultNodeDesign(n);
            }
        });

        // Make sure we have all needed connections in the design
        graph.getConnections().forEach(c => {
            if (!design.connections[c.id]) {
                design.connections[c.id] = createDefaultConnectionDesign(c);
            }
        });
    }

    const res: ModelView = {
        graph,
        design,
        nodesOrder: [],
        nodes: {},
        nodesSelected: [],
        connections: {},
        history: {
            records: [],
            pointer: 0
        },
        pan: maybeDesign ? maybeDesign.pan : options.design.defaultPan || getPerfectPan(graph, design),
        scale: maybeDesign ? maybeDesign.scale : options.design.defaultScale || 1.0,
        editingConnection: undefined,
        inspectMode: false
    };
    const gr = res.graph;
    const de = res.design;

    const nodes = gr.getNodes().map(n => ({
        node: n,
        design: de.nodes[n.nodeID]
    }));
    const connections = gr.getConnections().map(t => ({
        connection: t,
        design: de.connections[t.id]
    }));
    nodes.forEach(n => {
        res.nodes[n.node.nodeID] = n;
        res.nodesOrder.push(n.node.nodeID);
    });
    connections.forEach(t => {
        res.connections[t.connection.id] = t;
    });
    return res;
}

function buildActionsState(
    viewState: ModelView,
    redraw: () => void,
    options: Options,
    hooks: Partial<ModelHooks>,
    ref: React.RefObject<HTMLElement>
): ModelActions {
    function forceUpdate() {
        redraw();
    }

    function findNode(id: string): ModelNodeState | undefined {
        return viewState.nodes[id];
    }

    function findNodesInRect(rect: Rect): ModelNodeState[] {
        return findNodes(n => rectsOverlap(rect, n.design))
    }

    function findNodeAndPort(port: Port) {
        const node = findNode(port.node);
        if (!node) {
            return undefined;
        }

        const res = {
            node: node.node,
            flowIn: node.node.getFlowInputUnsafe(port.port),
            flowOut: node.node.getFlowOutputUnsafe(port.port),
            valueIn: node.node.getValueInputUnsafe(port.port),
            valueOut: node.node.getValueOutputUnsafe(port.port)
        };
        return res;
    }

    function findNodeFlowPort(port: Port) {
        const node = findNode(port.node);
        if (!node) {
            return undefined;
        }

        const res = {
            node: node.node,
            flowIn: node.node.getFlowInputUnsafe(port.port),
            flowOut: node.node.getFlowOutputUnsafe(port.port)
        };
        return res;
    }

    function findNodeValuePort(port: Port) {
        const node = findNode(port.node);
        if (!node) {
            return undefined;
        }

        const res = {
            node: node.node,
            valueIn: node.node.getValueInputUnsafe(port.port),
            valueOut: node.node.getValueOutputUnsafe(port.port)
        };
        return res;
    }

    function findNodes(predicate: (node: ModelNodeState) => boolean): ModelNodeState[] {
        return Object.values(viewState.nodes).filter(predicate);
    }

    function findConnections(predicate: (c: ModelConnectionState) => boolean): ModelConnectionState[] {
        return Object.values(viewState.connections).filter(predicate);
    }

    function setInspectMode(on: boolean) {
        if (viewState.inspectMode === on) {
            return;
        }

        viewState.inspectMode = on;
        forceUpdate();
    }

    function highlightNode(id?: string) {
        if (!viewState.inspectMode) {
            return;
        }

        viewState.nodeHighlight = id;
        forceUpdate();
    }

    function adjustPageCoords(coords: Coords, noPan?: boolean, noScale?: boolean): Coords {
        if (!ref.current) {
            return coords;
        }

        const br = ref.current.getBoundingClientRect();
        const shifted = {
            x: coords.x - br.left,
            y: coords.y - br.top
        };

        if (noPan && noScale) {
            return shifted;
        }

        if (noPan) {
            return adjustForScale(shifted);
        }

        if (noScale) {
            return adjustForPan(shifted);
        }

        return adjustForPanAndScale(shifted);
    }

    function adjustForPanAndScale(coords: Coords): Coords {
        const currentPan = viewState.pan;
        if (currentPan.x === 0 &&
            currentPan.y === 0 &&
            viewState.scale === 1.0
        ) {
            return coords;
        }

        return {
            x: (coords.x / viewState.scale) - currentPan.x,
            y: (coords.y / viewState.scale) - currentPan.y
        };
    }

    function adjustForScale(coords: Coords): Coords {
        if (viewState.scale === 1.0) {
            return coords;
        }

        return {
            x: coords.x / viewState.scale,
            y: coords.y / viewState.scale
        };
    }

    function adjustForPan(coords: Coords): Coords {
        const currentPan = viewState.pan;
        if (currentPan.x === 0 &&
            currentPan.y === 0
        ) {
            return coords;
        }

        return {
            x: coords.x - currentPan.x,
            y: coords.y - currentPan.y
        };
    }

    function lookAtNode(id: string): boolean {
        const node = viewState.nodes[id];
        if (!node) {
            return false;
        }

        const lookOffset = 200;
        pan({
            x: -node.design.x + lookOffset,
            y: -node.design.y + lookOffset,
        });
        return true;
    }

    function doPan(action: PanView) {
        const bb = options.design.boundingBox;
        const finalPan = {
            ...action.pan
        };
        if (finalPan.x < bb.x) {
            finalPan.x = bb.x;
        } else
        if (finalPan.x > bb.x + bb.width) {
            finalPan.x = bb.x + bb.width;
        }

        if (finalPan.y < bb.y) {
            finalPan.y = bb.y;
        } else
        if (finalPan.y > bb.y + bb.height) {
            finalPan.y = bb.y + bb.height;
        }

        if (finalPan.x === viewState.pan.x && finalPan.y === viewState.pan.y) {
            return {
                success: false
            };
        }

        viewState.pan = finalPan;
        viewState.design.pan = finalPan;
        return {
            success: true
        };
    }

    function doZoom(action: ZoomView) {
        let finalZoom = action.zoom;
        if (finalZoom < options.design.minScale) {
            finalZoom = options.design.minScale;
        } else
        if (finalZoom > options.design.maxScale) {
            finalZoom = options.design.maxScale;
        }
        // TODO Adjust pan so that it matches the new zoom view
        // TODO Add support for Anchor, so we can zoom in where the mouse is
        // if (action.anchor) {
        //     const diffX = action.anchor.x - viewState.pan.x;
        //     const diffY = action.anchor.y - viewState.pan.y;
        //     viewState.pan = {
        //         x: viewState.pan.x - Math.floor(diffX * finalZoom - diffX * viewState.scale),
        //         y: viewState.pan.y - Math.floor(diffY * finalZoom - diffY * viewState.scale)
        //     };
        // }

        viewState.scale = finalZoom;
        viewState.design.scale = finalZoom;
        return {
            success: true,
            redraw: true
        };
    }

    function doReorderNode(action: ReorderNode) {
        const {
            id,
            order
        } = action;
        const index = viewState.nodesOrder.indexOf(id);
        if (index < 0) {
            return {
                success: false
            };
        }
        let newIndex = index;
        switch (order) {
            case NodeOrder.BringForward: newIndex++; break;
            case NodeOrder.SendBackward: newIndex--; break;
            case NodeOrder.SendToBack: newIndex = 0; break;
            case NodeOrder.SendToFront: newIndex = viewState.nodesOrder.length - 1; break;
        }

        newIndex--;
        const nodesOrder = [
            ...viewState.nodesOrder
        ];
        nodesOrder.splice(index, 1);
        if (newIndex < 0) {
            newIndex = 0;
        } else
        if (newIndex > nodesOrder.length) {
            newIndex = nodesOrder.length;
        }
        nodesOrder.splice(newIndex, 0, id);
        return {
            success: true,
            redraw: true
        };
    }

    function doDeleteNodes(action: DeleteNodes) {
        if (action.ids.length === 0) {
            return {
                success: false
            };
        }
        action.ids.forEach(id => {
            viewState.graph.removeNode(id, false);
            delete viewState.design.nodes[id];

            delete viewState.nodes[id];
            if (viewState.nodeHighlight === id) {
                viewState.nodeHighlight = undefined;
            }
        });
        const linkedConnections = findConnections(c =>
            action.ids.indexOf(c.connection.source.node) >= 0 ||
            action.ids.indexOf(c.connection.destination.node) >= 0);
        linkedConnections.forEach(c => {
            viewState.graph.removeConnection(c.connection.id);
            delete viewState.design.connections[c.connection.id];
            delete viewState.connections[c.connection.id];
        });
        viewState.nodesOrder = viewState.nodesOrder.filter(n => action.ids.indexOf(n) < 0);
        viewState.nodesSelected = viewState.nodesSelected.filter(n => action.ids.indexOf(n) < 0);
        Object.values(viewState.nodes).forEach(n => revalidateNode(n.node.nodeID, false));
        return {
            success: true,
            redraw: true
        };
    }

    function doCreateNodes(action: CreateNodes) {
        if (action.nodes.length === 0) {
            return {
                success: false
            };
        }
        action.nodes.forEach(n => {
            const nid = n.node.nodeID;
            const nodeState: ModelNodeState = {
                node: n.node,
                design: {
                    ...createDefaultNodeDesign(n.node),
                    ...(n.pos)
                }
            };
            viewState.nodes[nid] = nodeState;
            viewState.nodesOrder.push(nid);
            // Update original models
            viewState.graph.addNode(n.node);
            viewState.design.nodes[nid] = nodeState.design;
        });
        Object.values(viewState.nodes).forEach(n => revalidateNode(n.node.nodeID, false));
        return {
            success: true,
            redraw: true
        };
    }

    function doSelectNodes(action: SelectNodes) {
        const { ids, deselectSelection, keepOrder } = action;
        const res = {
            nodesOrder: keepOrder ? viewState.nodesOrder : viewState.nodesOrder.filter(no => ids.indexOf(no) < 0),
            nodes: {
                ...viewState.nodes
            }
        };
        let modified = false;
        if (deselectSelection) {
            Object.values(res.nodes).forEach(n => {
                if (!n.selected) {
                    return;
                }
                modified = true;
                res.nodes[n.node.nodeID] = {
                    ...n,
                    selected: undefined
                };
            });
        }
        ids.forEach(i => {
            const n = res.nodes[i];
            if (!n) {
                console.warn(`Trying to select node ${i} which doesn't exist.`);
                return;
            }
            if (!keepOrder) {
                res.nodesOrder.push(i);
            }
            if (n.selected) {
                return;
            }
            modified = true;
            res.nodes[i] = {
                ...n,
                selected: true
            };
        });

        if (modified || !keepOrder) {
            const selected = (deselectSelection ? [] : viewState.nodesSelected.slice()).concat(ids);
            viewState.nodesOrder = res.nodesOrder;
            viewState.nodes = res.nodes;
            viewState.nodesSelected = selected;
            return {
                success: true,
                redraw: true
            };
        }
        return {
            success: false
        };
    }

    function doMoveNodes(action: MoveNodes) {
        const { nodes } = action;
        for (const node of nodes) {
            const nodeState = viewState.nodes[node.id];
            if (!nodeState) {
                throw new Error(`Trying to move node ${node.id} which doesn't exist.`);
            }
            const updatedNode = {
                ...nodeState,
                design: {
                    ...nodeState.design,
                    ...node.pos
                }
            };
            viewState.nodes[node.id] = updatedNode;
            viewState.design.nodes[node.id] = updatedNode.design;
        }
        return {
            success: true,
            redraw: true
        };
    }

    function doUpdateConnection(action: UpdateConnection) {
        const {
            source,
            destination,
            disabled,
            id
        } = action;

        const checkNodes: {[key: string]: boolean} = {};
        const conn = viewState.connections[id];
        if (typeof source !== 'undefined') {
            checkNodes[conn.connection.source.node] = true;
            checkNodes[source.node] = true;
            conn.connection.source = source;
        }
        if (typeof destination !== 'undefined') {
            checkNodes[conn.connection.destination.node] = true;
            checkNodes[destination.node] = true;
            conn.connection.destination = destination;
        }
        if (typeof disabled !== 'undefined') {
            conn.connection.disabled = disabled ? true : undefined;
        }
        const entry: ModelConnectionState = {
            ...conn
        };
        viewState.connections[id] = entry;

        Object.keys(checkNodes).forEach(cn => revalidateNode(cn, false));
        revalidateConnection(entry.connection.id, false);

        return {
            success: true,
            redraw: true
        };
    }

    function doDeleteConnections(action: DeleteConnections) {
        if (action.ids.length === 0) {
            return {
                success: false
            };
        }

        const checkNodes: {[key: string]: boolean} = {};
        action.ids.forEach(c => {
            viewState.graph.removeConnection(c);
            delete viewState.design.connections[c];

            const conn = viewState.connections[c];
            checkNodes[conn.connection.source.node] = true;
            checkNodes[conn.connection.destination.node] = true;
            delete viewState.connections[c];
        });

        Object.keys(checkNodes).forEach(cn => revalidateNode(cn, false));
        
        return {
            success: true,
            redraw: true
        };
    }

    function doCreateConnection(action: CreateConnection) {
        const {
            from,
            to,
            connectionType
        } = action;

        let connection: Connection;
        switch (connectionType) {
            case ConnectionType.Flow:
                connection = viewState.graph.createFlowConnection(from.node, to.node, from.port, to.port);
                break;

            case ConnectionType.Value:
                connection = viewState.graph.createDataConnection(from, to);
                break;

            default:
                throw new Error('Unexpected connection type: ' + connectionType);
        }

        const entry: ModelConnectionState = {
            connection,
            design: {}
        };
        viewState.design.connections[connection.id] = entry.design;
        viewState.connections[connection.id] = entry;
        revalidateNode(entry.connection.source.node, false);
        revalidateNode(entry.connection.destination.node, false);
        revalidateConnection(entry.connection.id, false);

        return {
            success: true,
            redraw: true,
            data: connection.id
        };
    }
    
    function compressor(action: ActionType): ActionCompressor<any> | undefined {
        switch (action.type) {
            case 'PanView': return PanViewCompressor;
            case 'ZoomView': return ZoomViewCompressor;
            case 'SelectNodes': return SelectNodesCompressor;
            case 'MoveNodes': return MoveNodesCompressor;
            default:
                return undefined;
        }
    }

    function doAction<D>(action: ActionType): D | undefined {
        const history = viewState.history;
        const recs = history.records;
        
        // Push into the history
        // TODO We need to remember the state here, so that
        // we can then restore it on Undo. Those should be on
        // per action basis for the best performance.
        if (recs.length > 0) {
            const last = recs[recs.length - 1];
            let compressed: ActionType | undefined;
            if (last && last.action && last.action.type === action.type) {
                const compress = compressor(action);
                if (compress) {
                    compressed = compress(last.action, action);
                }
            }
            
            if (history.records.length > 0) {
                const tail = history.records.length - 1 - history.pointer;
                if (tail > 0) {
                    history.records.splice(history.pointer + 1, tail);
                }
            }
            if (compressed) {
                history.records[history.pointer] = {
                    action: compressed
                };
            } else {
                history.pointer++;
                history.records.push({
                    action
                });
    
                if (history.records.length > options.design.historyLength) {
                    history.pointer--;
                    history.records.splice(0, 1);
                }
            }
            
        } else {
            history.pointer = 0;
            history.records.push({
                action
            });
        }

        // Execute it
        let actionResult: ActionResult<D> | undefined;
        switch (action.type) {
            case 'PanView': actionResult = doPan(action); break;
            case 'ZoomView': actionResult = doZoom(action); break;
            case 'ReorderNode': actionResult = doReorderNode(action); break;
            case 'CreateNodes': actionResult = doCreateNodes(action); break;
            case 'DeleteNodes': actionResult = doDeleteNodes(action); break;
            case 'SelectNodes': actionResult = doSelectNodes(action); break;
            case 'MoveNodes': actionResult = doMoveNodes(action); break;
            case 'CreateConnection': actionResult = doCreateConnection(action) as unknown as ActionResult<D>; break;
            case 'UpdateConnection': actionResult = doUpdateConnection(action); break;
            case 'DeleteConnections': actionResult = doDeleteConnections(action); break;
            default:
                throw new Error(`Action ${action.type} is not implemented.`);
        }
        if (typeof actionResult === 'undefined') {
            throw new Error(`Action ${action.type} is not implemented correctly.`);
        }

        // TODO When an action is done, in case it was successful, then we can
        // add a record to the history. For example, selecting the already
        // selected node should not be a part of the history.

        if (actionResult.redraw) {
            forceUpdate();
        }
        return actionResult.data;
    }

    function pan(updatedPan: Coords) {
        return doAction({
            type: 'PanView',
            pan: updatedPan
        });
    }

    function zoom(value: number, anchor?: Coords) {
        return doAction({
            type: 'ZoomView',
            zoom: value,
            anchor
        });
    }

    function groupNodes(ids: string[]) {
        return doAction({
            type: 'GroupNodes',
            ids,
            name: 'Group'
        });
    }

    function ungroupNodes(id: string) {
        return doAction({
            type: 'UngroupNodes',
            id
        });
    }

    function reorderNode(id: string, order: NodeOrder) {
        return doAction({
            type: 'ReorderNode',
            id,
            order
        });
    }

    function selectNodes(id: string | string[], deselectSelection?: boolean, keepOrder?: boolean) {
        const ids = Array.isArray(id) ? id : [id];
        return doAction({
            type: 'SelectNodes',
            ids,
            deselectSelection,
            keepOrder
        });
    }

    function createNode(node: Node, pos?: Coords) {
        return doAction({
            type: 'CreateNodes',
            nodes: [{
                node,
                pos: pos || {x: 0, y: 0}
            }]
        });
    }

    function createNodes(nodes: Array<{node: Node, pos?: Coords}>) {
        return doAction({
            type: 'CreateNodes',
            nodes: nodes.map(n => ({
                node: n.node,
                pos: n.pos || {x: 0, y: 0}
            }))
        });
    }

    function deleteNodes(nodes: string[] | string) {
        return doAction({
            type: 'DeleteNodes',
            ids: typeof nodes === 'string' ? [nodes] : nodes
        });
    }

    function moveNode(id: string, pos: Coords) {
        return moveNodes([{id, pos}]);
    }

    function moveNodes(nodes: Array<{id: string, pos: Coords}>) {
        return doAction({
            type: 'MoveNodes',
            nodes
        });
    }

    function shiftNode(id: string, shift: Partial<Coords>) {
        return shiftNodes([{id, shift}]);
    }
    
    function shiftNodes(nodes: Array<{id: string, shift: Partial<Coords>}>) {
        const moves = nodes
            .filter(n => typeof n.shift.x !== 'undefined' || typeof n.shift.y !== 'undefined')
            .filter(n => typeof viewState.nodes[n.id] !== 'undefined')
            .map(n => {
                const nd = viewState.nodes[n.id].design;
                return {
                    id: n.id,
                    pos: {
                        x: typeof n.shift.x !== 'undefined' ? nd.x + n.shift.x : nd.x,
                        y: typeof n.shift.y !== 'undefined' ? nd.y + n.shift.y : nd.y
                    }
                };
            });
        return doAction({
            type: 'MoveNodes',
            nodes: moves
        });
    }

    function createConnection(from: Port, to: Port, type: ConnectionType): string {
        const res = doAction<string>({
            type: 'CreateConnection',
            from,
            to,
            connectionType: type
        });
        
        return res as string;
    }

    function updateConnection(id: string, from?: Port, to?: Port, disabled?: boolean) {
        return doAction({
            type: 'UpdateConnection',
            id,
            source: from,
            destination: to,
            disabled
        });
    }

    function deleteConnections(connections: string[] | string) {
        return doAction({
            type: 'DeleteConnections',
            ids: typeof connections === 'string' ? [connections] : connections
        });
    }

    function beginConnectionEdit(port: Port, pos: Coords) {
        const nodePorts = findNodeAndPort(port);
        if (!nodePorts) {
            throw new Error(`Unexpected port ${port.port} for node ${port.node}. Not found.`);
        }
        const isFlow = nodePorts && (nodePorts.flowIn || nodePorts.flowOut) ? true : false;
        const isOut = isFlow ? (nodePorts.flowOut ? true : false) : (nodePorts.valueOut ? true : false);

        const existingConnections = findConnections(c =>
            (c.connection.source.node === port.node && c.connection.source.port === port.port) ||
            c.connection.destination.node === port.node && c.connection.destination.port === port.port);

        const existing = existingConnections.length > 0 ? existingConnections[0] : undefined;
        if (existing) {
            const conn = existing.connection;
            // For existing, we need to reverse the port as the user is going to
            // drag the other end of the connection
            const useDestination = conn.source.port === port.port;
            viewState.editingConnection = {
                type: conn.type,
                isAnchorOut: useDestination ? false : true,
                reference: conn.id,

                anchorPort: useDestination ? conn.destination : conn.source,
                anchorPos: pos,

                targetPort: undefined,
                targetPos: pos
            };
        } else {
            viewState.editingConnection = {
                isAnchorOut: isOut,
                type: isFlow ? ConnectionType.Flow : ConnectionType.Value,
                reference: undefined,

                anchorPort: port,
                anchorPos: pos,
                
                targetPort: undefined,
                targetPos: pos
            };
        }
        forceUpdate();
    }

    function updateConnectionEditTarget(targetPort: Port | undefined, targetPos: Coords) {
        if (!viewState.editingConnection) {
            return;
        }

        viewState.editingConnection = {
            ...viewState.editingConnection,
            targetPort,
            targetPos
        };
        forceUpdate();
    }

    function cancelConnectionEdit() {
        if (!viewState.editingConnection) {
            return;
        }

        viewState.editingConnection = undefined;
        forceUpdate();
    }

    function finishConnectionEdit() {
        if (!viewState.editingConnection) {
            return;
        }

        const editConn = viewState.editingConnection;

        if (!editConn.targetPort) {
            cancelConnectionEdit();
            return;
        }

        // In editor, it possible to drag from in to out ports, so we need
        // to make sure we reverse them if they are reversed        
        const from = editConn.isAnchorOut ? editConn.anchorPort : editConn.targetPort;
        const to = editConn.isAnchorOut ? editConn.targetPort : editConn.anchorPort;

        if (!isValidConnection(from, to)) {
            cancelConnectionEdit();
            return;
        }

        viewState.editingConnection = undefined;

        // TODO Apply policies here:
        // policy: {
        //     ports: {
        //         flowOut: PortConflictPolicy.Replace,
        //         valueIn: PortConflictPolicy.Replace
        //     }
        // }

        let connectionID: string | undefined;
        if (editConn.reference) {
            const existing = viewState.connections[editConn.reference];

            // Revalidate the disconnected node as well
            const disconnectedNode = existing.connection.source.node !== from.node &&
                existing.connection.source.node !== to.node ? existing.connection.source.node : existing.connection.destination.node;

            connectionID = existing.connection.id;
            updateConnection(existing.connection.id, from, to);
            revalidateNode(disconnectedNode, false);
        } else {
            connectionID = createConnection(from, to, editConn.type);
        }

        // Since we reconnected stuff, we need to re-validate the nodes and the new connection, if needed
        revalidateConnection(connectionID, false);
        revalidateNode(from.node, false);
        revalidateNode(to.node, false);
        if (hooks.onPortsConnected) {
            hooks.onPortsConnected(
                connectionID,
                from,
                to
            );
        }
    }

    function beginNodeEdit(node: Node | string): void {
        if (viewState.history.nodeEdit) {
            throw new Error(`There is an ongoing edit of node ${viewState.history.nodeEdit}. Close transaction first.`);
        }
        viewState.history.nodeEdit = typeof node === 'string' ? node : node.nodeID;
        // TODO Serialize state and put it into nodeEdit field
    }

    function finishNodeEdit() {
        if (!viewState.history.nodeEdit) {
            throw new Error(`There is no transaction to finish.`);
        }
        const node = viewState.nodes[viewState.history.nodeEdit];
        // TODO Cleanup history state here
        // TODO Check also for editingConnection?
        // if (viewState.editingConnection && viewState.editingConnection.reference ... )
        // We need to make sure that the node didn't change its ports. If ports are absent, for whatever
        // reason, we need to drop referenced connections as well.
        const refInputs = findConnections(c => c.connection.destination.node === viewState.history.nodeEdit);
        const refOutputs = findConnections(c => c.connection.source.node === viewState.history.nodeEdit);
        refInputs.forEach(c => {
            if (
                !node.node.getFlowInputUnsafe(c.connection.destination.port) &&
                !node.node.getValueInputUnsafe(c.connection.destination.port)) {
                delete viewState.connections[c.connection.id];
                viewState.graph.removeConnection(c.connection.id);
            }
        });
        refOutputs.forEach(c => {
            if (
                !node.node.getFlowOutputUnsafe(c.connection.source.port) &&
                !node.node.getValueOutputUnsafe(c.connection.source.port)) {
                delete viewState.connections[c.connection.id];
                viewState.graph.removeConnection(c.connection.id);
            }
        });

        revalidateNode(node.node.nodeID, false);
        redrawNode(viewState.history.nodeEdit);
        viewState.history.nodeEdit = undefined;
    }

    function revalidateNode(node: string, commitRedraw: boolean = true) {
        const n = viewState.nodes[node];
        if (!n) {
            throw new Error(`revalidateNode can't find node: ${node}`);
        }
        const invalid = n.node.validate ? n.node.validate(viewState.graph) : undefined;
        if (n.invalid !== invalid) {
            n.invalid = invalid;
            redrawNode(node, commitRedraw);
        }
    }

    function revalidateConnection(id: string, commitRedraw: boolean = true) {
        const c = viewState.connections[id];
        if (!c) {
            throw new Error(`revalidateConnection can't find connection: ${id}`);
        }

        let invalid: string | undefined;
        if (c.connection.type === ConnectionType.Flow) {
            invalid = isValidConnection(c.connection.source, c.connection.destination) ? undefined : 'Invalid flow connection.';
        } else {
            const fromPort = viewState.graph.getNodeOutputValue(c.connection.source);
            if (!fromPort) {
                throw new Error(`Inconsistent model, no port found: ${c.connection.source.node}:${c.connection.source.port}`);
            }
            const fromType = fromPort.value.value.defn.id;
            const toPort = viewState.graph.getNodeInputValue(c.connection.destination);
            if (!toPort) {
                throw new Error(`Inconsistent model, no port found: ${c.connection.source.node}:${c.connection.source.port}`);
            }
            const toType = toPort.value.value.defn.id;
            if (toType !== fromType) {
                // Check if we have a conversion in the graph registered
                const converter = viewState.graph.getConverter(fromType, toType);
                if (!converter) {
                    invalid = `Source(${fromType}) and destination(${toType}) values are not compatible, or conversion is missing.`;
                }
            }
        }
        if (invalid !== c.invalid) {
            c.invalid = invalid;
            if (commitRedraw) {
                redrawConnection(id, commitRedraw);
            }
        }
    }

    function cancelNodeEdit() {
        if (!viewState.history.nodeEdit) {
            throw new Error(`There is no transaction to cancel.`);
        }
        // TODO Reset history transaction state for this node
        viewState.history.nodeEdit = undefined;
    }

    function isValidConnection(fromPort: Port, toPort: Port) {
        const from = findNodeAndPort(fromPort);
        const to = findNodeAndPort(toPort);

        if (!from || !to) {
            return false;
        }

        if (from.node.nodeID === to.node.nodeID &&
            (!options.validation.selfConnectedNodes || fromPort.port === toPort.port)) {
            return false;
        }
        
        const isFromFlow = from.flowIn || from.flowOut ? true : false;
        const isToFlow = to.flowIn || to.flowOut ? true : false;
        const isFromValue = from.valueIn || from.valueOut ? true : false;
        const isToValue = to.valueIn || to.valueOut ? true : false;
        if (isFromFlow && isToFlow) {
            const flowOut = from.flowOut || to.flowOut;
            const flowIn = from.flowIn || to.flowIn;
            // Must be a reverse in / out, otherwise invalid
            if (!flowOut || !flowIn) {
                return false;
            }
            // const existingOut = model.findConnections(c => c.connection.source.node === flowOut.)
            // TODO Check that out doesn't have a connection already, or it will break the logic
            // behind the output decision
            return true;
        } else
        if (isFromValue && isToValue) {
            const valueOut = from.valueOut || to.valueOut;
            const valueIn = from.valueIn || to.valueIn;
            // Must be a reverse in / out, otherwise invalid
            if (!valueOut || !valueIn) {
                return false;
            }
            // TODO Validate that data types match or conversion exists
            return true;
        }
        return false;
    }

    function redrawNode(node: Node | string, commitRedraw: boolean = true) {
        const nodeID = typeof node === 'string' ? node : node.nodeID;
        const n = viewState.nodes[nodeID];
        viewState.nodes[nodeID] = {
            ...n,
            design: {
                ...n.design
            }
        };
        if (commitRedraw) {
            forceUpdate();
        }
    }

    function redrawConnection(connection: Connection | string, commitRedraw: boolean = true) {
        const id = typeof connection === 'string' ? connection : connection.id;
        const c = viewState.connections[id];
        viewState.connections[id] = {
            ...c,
            design: {
                ...c.design
            }
        };
        if (commitRedraw) {
            forceUpdate();
        }
    }

    function getZoom(): number {
        return viewState.scale;
    }

    function getPan(): Coords {
        return viewState.pan;
    }

    function getNewNodeID(): string {
        return newID();
    }

    function getNewConnectionID(): string {
        return newID();
    }

    function getOngoingConnection(): {port: Port, type: ConnectionType} | undefined {
        if (!viewState.editingConnection) {
            return undefined;
        }

        return {
            port: viewState.editingConnection.anchorPort,
            type: viewState.editingConnection.type
        }
    }

    function getSelectedNodes(): ModelNodeState[] {
        return viewState.nodesSelected.map(ns => viewState.nodes[ns]);
    }

    function undo() {
        return false;
    }

    function redo() {
        return false;
    }

    return {
        undo,
        redo,
        do: doAction,

        // Editor
        setInspectMode,
        highlightNode,
        pan,
        zoom,
        lookAtNode,

        reorderNode,
        selectNodes,
        groupNodes,
        ungroupNodes,

        beginConnectionEdit,
        updateConnectionEditTarget,
        cancelConnectionEdit,
        finishConnectionEdit,

        beginNodeEdit,
        finishNodeEdit,
        cancelNodeEdit,

        // Nodes
        createNode,
        createNodes,
        moveNode,
        moveNodes,
        shiftNode,
        shiftNodes,
        deleteNodes,

        // Connections
        createConnection,
        updateConnection,
        deleteConnections,

        // Helpers
        adjustForPanAndScale,
        adjustForScale,
        adjustForPan,
        adjustPageCoords,
        findNode,
        findNodesInRect,
        findNodes,
        getOngoingConnection,
        getSelectedNodes,
        findNodeAndPort,
        findNodeFlowPort,
        findNodeValuePort,
        findConnections,
        isValidConnection,
        redrawNode,
        redrawConnection,
        getZoom,
        getPan,
        getNewNodeID,
        getNewConnectionID
    };
}

export function useModel(
    graph: Graph,
    design: Design | undefined,
    options: Options,
    hooks: Partial<ModelHooks>,
    ref: React.RefObject<HTMLElement>
): [ModelView, ModelActions] {
    const [, setUpdateTime] = useState(Date.now);
    const redraw = useMemo(() => {
        return () => setUpdateTime(Date.now);
    }, [setUpdateTime]);

    function buildState(): [ModelView, ModelActions] {
        const vs = buildDefaultState(graph, design, options);
        const as = buildActionsState(vs, redraw, options, hooks, ref);
        return [vs, as];
    }

    const [[viewState, actionsState], setState] = useState(buildState);

    useEffect(() => {
        const vs = buildDefaultState(graph, design, options);
        const as = buildActionsState(vs, redraw, options, hooks, ref);
        setState([vs, as]);
    }, [graph, design, options, hooks]);

    return [
        viewState,
        actionsState
    ];
}

// @ts-ignore
export const ModelViewContext = React.createContext<ModelView>({});
// @ts-ignore
export const ModelActionsContext = React.createContext<ModelActions>({});

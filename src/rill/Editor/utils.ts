import { ModelActions, ModelConnectionState, ModelNodeState } from './model';
import { Registry, NodeJSON, ConnectionJSON, Coords } from '../model';

export interface ModelChunkJSON {
    nodes: NodeJSON[];
    // TODO This piece has to be serializable as a type,
    // so we don't have to copy this structure. Plus typescript
    // will guarantee fullness of it.
    nodesDesign: {[key: string]: {
        pos: Coords;
        color?: string;
    }};
    connections: ConnectionJSON[];
    ref: 'rill',
    version: 1
}

export function copyModelSelectionJSON(actions: ModelActions): ModelChunkJSON {
    const selectedNodes = actions.getSelectedNodes();
    return copyModelJSON(actions, selectedNodes);
}

export function copyModelJSON(actions: ModelActions, nodesToCopy: ModelNodeState[]): ModelChunkJSON {
    const nodes = nodesToCopy.map(n => n.node);
    const nodesDesign: {[key: string]: {pos: Coords, color?: string}} = {};
    nodesToCopy.forEach(n => nodesDesign[n.node.nodeID] = {pos: {x: n.design.x, y: n.design.y}, color: n.design.color});
    const nodesJSON = nodes.map(n => n.toJSON());
    const nodesIDs = nodes.map(n => n.nodeID);
    const isConnectionBetweenNodes = (c: ModelConnectionState) =>
    nodesIDs.indexOf(c.connection.source.node) >= 0 &&
        nodesIDs.indexOf(c.connection.destination.node) >= 0 ? true : false;
    const connections = actions.findConnections(isConnectionBetweenNodes).map(c => c.connection);
    // Make a clone of it
    const cbData: ModelChunkJSON = JSON.parse(JSON.stringify({
        nodes: nodesJSON,
        nodesDesign,
        connections,
        ref: 'rill',
        version: 1
    }));
    return cbData;
}

export function pasteModelJSON(chunk: ModelChunkJSON, actions: ModelActions, registry: Registry): boolean {
    if (
        chunk.ref !== 'rill' || chunk.version !== 1 ||
        !chunk.nodes || !Array.isArray(chunk.nodes) ||
        !chunk.connections || !Array.isArray(chunk.connections)) {
        return false;
    }

    // before we proceed, make a clone of the chunk model
    const json: ModelChunkJSON = JSON.parse(JSON.stringify(chunk));

    const nodesRemap: {[key: string]: string} = {};
    const nodesRemapReverse: {[key: string]: string} = {};

    let minX: number | undefined;
    let minY: number | undefined;
    Object.values(json.nodesDesign).forEach(nd => {
        if (typeof minX === 'undefined') {
            minX = nd.pos.x;
        } else
        if (minX > nd.pos.x) {
            minX = nd.pos.x;
        }

        if (typeof minY === 'undefined') {
            minY = nd.pos.y;
        } else
        if (minY > nd.pos.y) {
            minY = nd.pos.y;
        }
    });

    const nodes = json.nodes.map(n => {
        const node = registry.create(n.class);
        node.fromJSON(n);
        const newID = actions.getNewNodeID();
        nodesRemap[n.id] = newID;
        nodesRemapReverse[newID] = n.id;
        node.nodeID = newID;
        return node;
    });
    
    const connections = json.connections.map(c => {
        const connection = c;
        connection.id = actions.getNewConnectionID();
        const destID = nodesRemap[c.destination.node];
        const sourceID = nodesRemap[c.source.node];
        if (!destID || !sourceID) {
            throw new Error(`Inconsistent connection ${c.id} between nodes.`);
        }
        connection.destination.node = destID;
        connection.source.node = sourceID;
        return connection;
    });

    const pan = actions.getPan();
    const BasicShift = 200;
    if (typeof minX === 'undefined') {
        minX = 0;
    }
    if (typeof minY === 'undefined') {
        minY = 0;
    }

    const nodesWithDesign = nodes.map(n => {
        const design = json.nodesDesign[nodesRemapReverse[n.nodeID]];
        if (!design) {
            throw new Error(`No design specified for node: ${n.nodeID}`);
        }
        return {
            node: n,
            pos: {
                x: - pan.x + BasicShift + (design.pos.x - (minX as number)),
                y: - pan.y + BasicShift + (design.pos.y - (minY as number))
            }
        };
    });

    actions.createNodes(nodesWithDesign);
    connections.forEach(c => {
        // TODO Add addConnection method, so we don't have to actually create a new one but
        // add existing one
        actions.createConnection(c.source, c.destination, c.type);
    });

    actions.selectNodes(nodes.map(n => n.nodeID), true);
    return true;
}

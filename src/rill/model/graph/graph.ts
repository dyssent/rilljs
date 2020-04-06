import {
    NodeJSON,
    Node,
    NodeInvalidSerializedTypeError,
    InputFlow,
    IOFlow,
    OutputFlow,
    InputValue,
    OutputValue
} from '../nodes';
import { Registry, defaultRegistry } from '../registry';
import {
    InstanceIDAlreadyExists,
    InstanceDoesntExist,
    ConnectionIsNotValid,
    InvalidPort
} from './error';
import { Connection, ConnectionJSON, Port, ConnectionType } from '../connections';
import { newID } from '../utils';
import { ConverterFrom, ConverterTo } from '../data';

export interface GraphJSON {
    nodes: {
        [instance: string]: NodeJSON;
    };
    transitions: {
        [instance: string]: ConnectionJSON;
    }
}

export class Graph {
    protected nodes: Node[];
    protected nodesMap: {[instance: string]: Node};
    protected connections: Connection[];
    protected connectionsMap: {[instance: string]: Connection};
    protected convertersFrom: ConverterFrom[];
    protected convertersTo: ConverterTo[];
    protected convertersMap: {[fromToType: string]: {
        from: ConverterFrom;
        to: ConverterTo;
    }};

    constructor(
        nodes: Node[] = [],
        connections: Connection[] = [],
        convertersFrom: ConverterFrom[] = [],
        convertersTo: ConverterTo[] = []) {

        this.nodes = nodes;
        this.nodesMap = {};
        this.connections = connections;
        this.connectionsMap = {};
        nodes.forEach(n => this.nodesMap[n.nodeID]);
        connections.forEach(t => this.connectionsMap[t.id]);
        this.convertersFrom = convertersFrom;
        this.convertersTo = convertersTo;
        this.convertersMap = {};
        convertersFrom.forEach(c => {
            const baseID = c.baseType;
            const fromTypes = typeof c.fromTypes === 'string' ? [c.fromTypes] : c.fromTypes;
            fromTypes.forEach(ft => {
                const key = this.getConverterKey(ft, baseID);
                const existing = this.convertersMap[key] || {};
                if (existing.from) {
                    throw new Error(`Converter between types ${ft} and ${baseID} is ambiguous. Provided multiple times.`);
                }
                existing.from = c;
                this.convertersMap[key] = existing;
            });
        });
        convertersTo.forEach(c => {
            const baseID = c.baseType;
            const toTypes = typeof c.toTypes === 'string' ? [c.toTypes] : c.toTypes;
            toTypes.forEach(tt => {
                const key = this.getConverterKey(baseID, tt);
                const existing = this.convertersMap[key] || {};
                if (existing.to) {
                    throw new Error(`Converter between types ${baseID} and ${tt} is ambiguous. Provided multiple times.`);
                }
                existing.to = c;
                this.convertersMap[key] = existing;
            });
        });
    }

    protected getConverterKey(from: string, to: string) {
        return `${from} -> ${to}`;
    }

    getConverter(from: string, to: string): {
        from: ConverterFrom,
        to: ConverterTo
    } | undefined {
        return this.convertersMap[this.getConverterKey(from, to)];
    }

    getConverterMethod<CV = unknown, FV = unknown, TV = unknown, M = unknown>(from: string, to: string, meta?: M) {
        const converter = this.getConverter(from, to);
        if (!converter) {
            return undefined;
        }

        if (converter.from) {
            const c = converter.from as ConverterFrom<CV, FV, M>;
            return (f: FV, m?: M): CV => {
                return c.convertFrom(f, from, m || meta);
            };
        } else
        if (converter.to) {
            const c = converter.to as ConverterTo<CV, TV, M>;
            return (value: CV, m?: M): TV => {
                return c.convertTo(value, to, m || meta);
            };
        }
        return undefined;
    }

    getConnections() {
        return this.connections;
    }

    getConnection(id: string): Connection | undefined {
        return this.connectionsMap[id];
    }

    getNodes() {
        return this.nodes;
    }

    getNode(instanceID: string): Node | undefined {
        return this.nodesMap[instanceID];
    }

    getNodeInputFlow(src: Port): { node: Node, flow: InputFlow } | undefined {
        return this.getNodeFlowPort(src, true);
    }

    getNodeOutputFlow(src: Port): { node: Node, flow: OutputFlow } | undefined {
        return this.getNodeFlowPort(src, false);
    }

    protected getNodeFlowPort(src: Port, input: boolean): { node: Node, flow: IOFlow } | undefined {
        const node = this.getNode(src.node);
        if (!node) {
            return undefined;
        }

        try {
            const flow = input ? node.getFlowInput(src.port) : node.getFlowOutput(src.port);
            if (!flow) {
                return undefined;
            }
            return {
                node,
                flow
            };
        } catch {
            return undefined;
        }
    }

    getNodeInputValue(src: Port): { node: Node, value: InputValue } | undefined {
        return this.getNodeValuePort(src, true);
    }

    getNodeOutputValue(src: Port): { node: Node, value: OutputValue } | undefined {
        return this.getNodeValuePort(src, false);
    }

    protected getNodeValuePort<T = IOFlow>(src: Port, input: boolean): { node: Node, value: T } | undefined {
        const node = this.getNode(src.node);
        if (!node) {
            return undefined;
        }

        try {
            const value = input ? node.getValueInput(src.port) : node.getValueOutput(src.port);
            if (!value) {
                return undefined;
            }
            return {
                node,
                value: value as unknown as T
            };
        } catch {
            return undefined;
        }
    }

    createFlowConnection(from: Node | string, to: Node | string, fromPort?: string, toPort?: string): Connection {
        const fromID = typeof from === 'string' ? from : from.nodeID;
        const toID = typeof to === 'string' ? to : to.nodeID;
        const fromNode = this.getNode(fromID);
        const toNode = this.getNode(toID);
        if (!fromNode || !toNode) {
            throw new InstanceDoesntExist(fromID + ` or ` + toID);
        }
        const flowOutputs = fromNode.getFlowOutputs();
        const fromPortID = fromPort ? fromNode.getFlowOutput(fromPort) : (flowOutputs.length > 0 ? flowOutputs[0] : undefined);
        if (!fromPortID) {
            throw new InvalidPort(fromNode.nodeID, 'Undefined Port');
        }

        const flowInputs = toNode.getFlowInputs();
        const toPortID = toPort ? toNode.getFlowInput(toPort) : (flowInputs.length > 0 ? flowInputs[0] : undefined);
        if (!toPortID) {
            throw new InvalidPort(toNode.nodeID, 'Undefined Port');
        }

        const connection: Connection = {
            id: newID(),
            source: {
                node: fromID,
                port: fromPortID.id
            },
            destination: {
                node: toID,
                port: toPortID.id
            },
            type: ConnectionType.Flow
        };
        this.addConnection(connection);
        return connection;
    }

    createDataConnection(from: { node: Node | string, port: string }, to: { node: Node | string, port: string }): Connection {
        const fromNodeID = typeof from.node === 'string' ? from.node : from.node.nodeID;
        const toNodeID = typeof to.node === 'string' ? to.node : to.node.nodeID;
        const fromNode = this.getNode(fromNodeID);
        const toNode = this.getNode(toNodeID);
        if (!fromNode) {
            throw new InstanceDoesntExist(fromNodeID);
        }
        if (!toNode) {
            throw new InstanceDoesntExist(toNodeID);
        }

        const fromPort = fromNode.getValueOutput(from.port);
        if (!fromPort) {
            throw new InvalidPort(fromNode.nodeID, from.port);
        }

        const toPort = toNode.getValueInput(to.port);
        if (!toPort) {
            throw new InvalidPort(toNode.nodeID, to.port);
        }

        const connection: Connection = {
            id: newID(),
            source: {
                node: fromNodeID,
                port: from.port
            },
            destination: {
                node: toNodeID,
                port: to.port
            },
            type: ConnectionType.Value
        };
        this.addConnection(connection);
        return connection;
    }

    addConnection(connection: Connection) {
        if (connection.id in this.connectionsMap) {
            throw new InstanceIDAlreadyExists(connection.id);
        }

        switch (connection.type) {
            case ConnectionType.Value: {
                const dataOut = this.getNodeOutputValue(connection.source);
                const dataIn = this.getNodeInputValue(connection.destination);
                if (!dataOut || !dataIn) {
                    throw new ConnectionIsNotValid(connection);
                }
                break;
            }

            case ConnectionType.Flow: {
                const flowOut = this.getNodeOutputFlow(connection.source);
                const flowIn = this.getNodeInputFlow(connection.destination);
                if (!flowOut || !flowIn) {
                    throw new ConnectionIsNotValid(connection);
                }    
                break;  
            }
        }

        const existingPair = this.connections.find(c =>
            c.destination.node === connection.destination.node &&
            c.destination.port === connection.destination.port &&
            c.source.node === connection.source.node &&
            c.source.port === connection.source.port);
        if (existingPair) {
            throw new ConnectionIsNotValid(connection, 'Such connection already exists.');
        }

        this.connections.push(connection);
        this.connectionsMap[connection.id] = connection;
    }

    removeConnection(connection: Connection | string) {
        const id = typeof connection === 'string' ? connection : connection.id;
        if (!(id in this.connectionsMap)) {
            throw new InstanceDoesntExist(id);
        }
        this.connections = this.connections.filter(n => n.id !== id);
        delete this.connectionsMap[id];
    }

    addNode(node: Node) {
        if (node.nodeID in this.nodesMap) {
            throw new InstanceIDAlreadyExists(node.nodeID);
        }
        this.nodes.push(node);
        this.nodesMap[node.nodeID] = node;
    }

    removeNode(node: Node | string, removeConnections: boolean = true) {
        const id = typeof node === 'string' ? node : node.nodeID;
        if (!(id in this.nodesMap)) {
            throw new InstanceDoesntExist(id);
        }
        this.nodes = this.nodes.filter(n => n.nodeID !== id);
        delete this.nodesMap[id];

        // Remove referenced connections as well
        if (removeConnections) {
            const referenced = this.connections.filter(c => c.source.node === id || c.destination.node === id);
            referenced.forEach(r => this.removeConnection(r));
        }
    }

    toJSON(): GraphJSON {
        const nodes: {[instance: string]: NodeJSON} = {};
        Object.values(this.nodes).forEach(n => nodes[n.nodeID] = n.toJSON());

        return {
            nodes,
            transitions: JSON.parse(JSON.stringify(this.connectionsMap))
        };
    }

    static fromJSON(json: GraphJSON, registry: Registry = defaultRegistry) {
        const res = new Graph();
        res.fromJSON(json, registry);
        return res;
    }

    fromJSON(json: GraphJSON, registry: Registry = defaultRegistry) {
        this.nodes = [];
        this.nodesMap = {};
        Object.values(json.nodes).forEach(n => {
            const node = registry.create(n.id);
            if (!node) {
                throw new NodeInvalidSerializedTypeError(n.id, n);
            }
            this.nodes.push(node);
            this.nodesMap[node.nodeID] = node;
        });
        this.connectionsMap = json.transitions;
        this.connections = Object.values(json.transitions);
    }
}

import { Node, NodeConstructor } from '../nodes';
import { DatumDefinition, DatumConstructor } from '../data';
import {
    RegistryAlreadyExistsError,
    RegistryUnknownClassError
} from './error';

type NodesMap = {[key: string]: {
    ctor: NodeConstructor,
    sample: Node
}};

type DataMap = {[key: string]: {
    ctor: DatumConstructor
}};

export class Registry {
    protected nodesMap: NodesMap;
    protected dataMap: DataMap;

    constructor(nodes: NodeConstructor[] = [], data: DatumConstructor[] = []) {
        this.nodesMap = {};
        this.dataMap = {};
        nodes.forEach(n => Registry.registerNode(n, this.nodesMap));
        data.forEach(d => Registry.registerDatum(d, this.dataMap));
    }

    registerNode(node: NodeConstructor) {
        Registry.registerNode(node, this.nodesMap);
    }

    static registerNode(node: NodeConstructor, nodesMap: NodesMap) {
        const instance = new node();
        if (instance.defn.class in nodesMap) {
            throw new RegistryAlreadyExistsError('Node', instance.defn.class);
        }
        nodesMap[instance.defn.class] = {
            ctor: node,
            sample: instance
        };
    }

    registerDatum(datum: DatumConstructor) {
        Registry.registerDatum(datum, this.dataMap);
    }

    static registerDatum(datum: DatumConstructor, dataMap: DataMap) {
        const defn = datum.defn;        
        if (defn.id in dataMap) {
            throw new RegistryAlreadyExistsError('Datum', defn.id);
        }
        dataMap[defn.id] = {
            ctor: datum
        };
    }

    findNodes(text: string | null, predicate?: (node: Node) => boolean): Node[] {
        const tl = text ? text.toLowerCase() : null;
        return Object
            .values(this.nodesMap)
            .filter(n => predicate ? predicate(n.sample) : true)
            .filter(n =>
                !tl || tl === '' ||
                `${n.sample.nodeID} ${n.sample.defn.name || ''} ${n.sample.defn.description || ''}`.toLowerCase().indexOf(tl) >= 0
            )
            .map(n => n.sample);
    }

    findDatum(text: string | null, predicate?: (datum: DatumDefinition) => boolean): DatumDefinition[] {
        const tl = text ? text.toLowerCase() : null;
        return Object
            .values(this.dataMap)
            .filter(n => predicate ? predicate(n.ctor.defn) : true)
            .filter(n =>
                !tl || tl === '' ||
                `${n.ctor.defn.id} ${n.ctor.defn.name || ''} ${n.ctor.defn.description || ''}`.toLowerCase().indexOf(tl) >= 0
            )
            .map(n => n.ctor.defn);
    }

    create<T extends Node>(id: string): T {
        const details = this.nodesMap[id];
        if (!details) {
            throw new RegistryUnknownClassError(id);
        }

        return new details.ctor() as T;
    }
}

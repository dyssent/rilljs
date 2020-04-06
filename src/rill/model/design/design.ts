import { NodeDesign } from './node';
import { Node } from '../nodes';
import { layout } from './layout';
import { ConnectionDesign } from './connection';
import { Connection } from '../connections';
import { GroupDesign } from './group';
import { Coords } from '../types';

export enum DesignViewMode {
    Detailed,
    Normal,
    Minimal
}

export interface Design {
    groups: GroupDesign[];
    nodes: {[instance: string]: NodeDesign};
    connections: {[instance: string]: ConnectionDesign};
    pan: Coords;
    scale: number;
    mode: DesignViewMode;
    version: 1
}

export function createDefaultNodeDesign(n: Node): NodeDesign {
    const design = n.designDefn;
    return {
        x: 0,
        y: 0,
        width: 200,
        height: (design && design.height) || 0   // Default to minHeight in theme
    };
}

export function createDefaultConnectionDesign(c: Connection): ConnectionDesign {
    return {
    };
}

export function createDefaultDesign(nodes: Node[] = [], connections: Connection[] = [], groups: GroupDesign[] = []) {
    const res: Design = {
        groups,
        nodes: {},
        connections: {},
        mode: DesignViewMode.Normal,
        pan: {x: 0, y: 0},
        scale: 1.0,
        version: 1
    };

    for (const n of nodes) {
        res.nodes[n.nodeID] = createDefaultNodeDesign(n);
    }

    for (const c of connections) {
        res.connections[c.id] = createDefaultConnectionDesign(c);
    }

    layout(res);
    return res;
}

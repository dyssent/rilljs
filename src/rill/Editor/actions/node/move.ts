import { Coords } from '../../../model';
import { Action } from '../action';

export interface MoveNodes extends Action {
    nodes: Array<{id: string, pos: Coords}>;
    type: 'MoveNodes';
}

export function MoveNodesCompressor(previous: MoveNodes, current: MoveNodes) {
    const prevNodes = previous.nodes.map(n => n.id).sort().join(',');
    const nextNodes = current.nodes.map(n => n.id).sort().join(',');
    if (prevNodes !== nextNodes) {
        return undefined;
    }
    return current;
}

import { Node, Coords } from '../../../model';
import { Action } from '../action';

export interface CreateNodes extends Action {
    type: 'CreateNodes';
    nodes: Array<{node: Node, pos: Coords}>;
}

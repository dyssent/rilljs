import { Action } from '../action';

export enum NodeOrder {
    SendToFront,
    BringForward,
    SendBackward,
    SendToBack
}

export interface ReorderNode extends Action {
    type: 'ReorderNode';
    id: string;
    order: NodeOrder;
}

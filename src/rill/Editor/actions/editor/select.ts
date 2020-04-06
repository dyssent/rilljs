import { Action } from '../action';

export interface SelectNodes extends Action {
    type: 'SelectNodes';
    ids: string[];
    deselectSelection?: boolean;
    keepOrder?: boolean;
}

export function SelectNodesCompressor(previous: SelectNodes, current: SelectNodes) {
    return current;
}

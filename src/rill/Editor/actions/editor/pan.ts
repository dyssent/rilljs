import { Action } from '../action';
import { Coords } from '../../../model';

export interface PanView extends Action {
    type: 'PanView';
    pan: Coords;
}

export function PanViewCompressor(previous: PanView, current: PanView) {
    return current;
}

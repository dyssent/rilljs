import { Action } from '../action';
import { Coords } from '../../../model';

export interface ZoomView extends Action {
    type: 'ZoomView';
    zoom: number;
    anchor?: Coords;
}

export function ZoomViewCompressor(previous: ZoomView, current: ZoomView) {
    return current;
}

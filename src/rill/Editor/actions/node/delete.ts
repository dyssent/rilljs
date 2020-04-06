import { Action } from '../action';

export interface DeleteNodes extends Action {
    type: 'DeleteNodes';    
    ids: string[];
}

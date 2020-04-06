import { Action } from '../action';

export interface DeleteConnections extends Action {
    type: 'DeleteConnections';    
    ids: string[];
}

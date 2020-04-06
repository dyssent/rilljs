import { Action } from '../action';

export interface GroupNodes extends Action {
    type: 'GroupNodes';
    ids: string[];
    name: string;
}

export interface UngroupNodes extends Action {
    type: 'UngroupNodes';
    id: string;
}

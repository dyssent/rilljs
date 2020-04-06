import { Action } from '../action';

export interface DesignConnection extends Action {
    connectionID: string;
    // design: NodeDesign;
    type: 'DesignConnection';
}

import { Action } from '../action';
import { Port, ConnectionType } from '../../../model';

export interface CreateConnection extends Action {
    type: 'CreateConnection';
    from: Port;
    to: Port;
    connectionType: ConnectionType;
}

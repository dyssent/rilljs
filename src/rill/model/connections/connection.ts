import { Port } from './port';

export enum ConnectionType {
    Flow = 'flow',
    Value = 'value'
}

export interface ConnectionJSON {
    id: string;
    source: Port;
    destination: Port;
    type: ConnectionType;
    disabled?: boolean;
}

export type Connection = ConnectionJSON;

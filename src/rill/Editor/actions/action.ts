import {
    PanView,
    SelectNodes,
    GroupNodes,
    UngroupNodes,
    ZoomView,
    ReorderNode
} from './editor';
import {
    CreateNodes,
    DeleteNodes,
    UpdateNode,
    MoveNodes
} from './node';
import {
    CreateConnection,
    DeleteConnections,
    DesignConnection,
    UpdateConnection
} from './connection';

export interface Action {
    type: string;
}

export type ActionType =
    PanView |
    ZoomView |
    ReorderNode |
    SelectNodes |
    GroupNodes |
    UngroupNodes |

    CreateNodes |
    DeleteNodes |
    MoveNodes |
    UpdateNode |

    CreateConnection |
    DeleteConnections |
    DesignConnection |
    UpdateConnection;

export type ActionCompressor<T extends Action> = (previous: T, current: T) => T | undefined;

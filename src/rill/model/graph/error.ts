import { Connection } from '../connections';

export abstract class GraphError extends Error {
}

export class InstanceIDAlreadyExists extends Error {
    constructor(id: string) {
        super(`Node instance with id ${id} already exists`);
    }
}

export class InstanceDoesntExist extends Error {
    constructor(id: string) {
        super(`Node instance with id ${id} doesn't exist`);
    }
}

export class ConnectionIsNotValid extends Error {
    constructor(conn: Connection, msg?: string) {
        super(`Connection is not valid: ${JSON.stringify(conn)} ${msg || ''}`);
    }
}

export class InvalidPort extends Error {
    constructor(node: string, port: string) {
        super(`Node instance $${node} has no valid port ${port}`);
    }
}
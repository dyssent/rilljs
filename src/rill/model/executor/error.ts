import { Node } from '../nodes';

export abstract class ExecutorError extends Error {
}

export class ExecutorUndefinedInputError extends ExecutorError {
    constructor(node: Node, input: string) {
        super(`Input ${input} value is undefined in node ${node}.`);
    }
}

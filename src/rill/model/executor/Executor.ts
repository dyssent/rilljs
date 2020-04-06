
export interface ExecutorRuntime<R = void, E = any> {
    /**
     * Start execution of a node
     */
    run: (
        onComplete?: (result: R) => void,
        onError?: (error: E) => void
    ) => R | Promise<R>;

    /**
     * Cancel execution of an executor, if undefined
     * it is assumed that the execution is instantinous
     * and does not require a cancellation
     */
    cancel?: () => void;

    /**
     * If provided, used to display execution progress
     * in the visual UI. Only getter, setter is not allowed.
     */
    progress?: number;

    /**
     * Is complete.
     * Only getter, setter is not allowed.
     */
    complete?: boolean;

    /**
     * Execution error.
     * Only getter, setter is not allowed.
     */
    error?: E;
}

export abstract class Executor<R = void> implements ExecutorRuntime<R> {
    abstract run(complete?: (result: R) => void): R;
}

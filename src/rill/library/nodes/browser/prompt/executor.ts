import { Executor } from '../../../../model';

export class BrowserPromptExecutor extends Executor<string | null> {
    protected message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    run() {
        return window.prompt(this.message);
    }
}

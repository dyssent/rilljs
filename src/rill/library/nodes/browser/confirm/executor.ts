import { Executor } from '../../../../model';

export class BrowserConfirmExecutor extends Executor<boolean> {
    protected message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    run() {
        return window.confirm(this.message);
    }
}

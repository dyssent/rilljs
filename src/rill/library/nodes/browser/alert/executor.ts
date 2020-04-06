import { Executor } from '../../../../model';

export class BrowserAlertExecutor extends Executor {
    protected message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    run() {
        window.alert(this.message);
    }
}

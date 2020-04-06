import { Executor } from '../../../../model';

export class ConsoleLogExecutor extends Executor {
    protected message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    run() {
        console.log(this.message);
    }
}

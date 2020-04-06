import { Node, ExecutorUndefinedInputError, NodeDefinition } from '../../../../model';
import { Text, Bool } from '../../../data';
import { BrowserConfirmExecutor } from './executor';

export const BrowserConfirmtNodeClass = 'BrowserConfirm';
export class BrowserConfirm extends Node<BrowserConfirmExecutor> {
    protected message: Text;
    protected result: Bool;

    get defn(): NodeDefinition {
        return {
            class: BrowserConfirmtNodeClass,
            name: 'Confirm Box',
            description: 'Confirm an action by user.'
        }
    }

    constructor(message: string = '') {
        super();

        this.message = new Text(message);
        this.result = new Bool();
        this.addValueInput<string>('message', this.message, {name: 'Message'});
        this.addValueOutput<boolean>('result', this.result, {name: 'Result'});
        this.addFlowThrough();        
    }

    executor(): BrowserConfirmExecutor {
        if (!this.message.value) {
            throw new ExecutorUndefinedInputError(this, 'Message');
        }
        return new BrowserConfirmExecutor(this.message.value);
    }
}

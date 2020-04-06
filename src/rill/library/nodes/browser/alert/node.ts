import { Node, ExecutorUndefinedInputError, NodeDefinition } from '../../../../model';
import { Text } from '../../../data';
import { BrowserAlertExecutor } from './executor';

export const BrowserAlertNodeClass = 'BrowserAlert';
export class BrowserAlert extends Node<BrowserAlertExecutor> {
    protected message: Text;

    get defn(): NodeDefinition {
        return {
            class: BrowserAlertNodeClass,
            name: 'Alert Box',
            description: 'Display browser alert box.'
        }
    }

    constructor(message: string = '') {
        super();

        this.message = new Text(message);
        this.addValueInput<string>('message', this.message, {name: 'Message'});
        this.addFlowThrough();        
    }

    executor(): BrowserAlertExecutor {
        if (!this.message.value) {
            throw new ExecutorUndefinedInputError(this, 'message');
        }
        return new BrowserAlertExecutor(this.message.value);
    }
}

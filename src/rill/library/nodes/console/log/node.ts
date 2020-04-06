import { Node, ExecutorUndefinedInputError, NodeDefinition, NodeDesign } from '../../../../model';
import { Text, Bool } from '../../../data';
import { ConsoleLogExecutor } from './executor';

export const ConsoleLogNodeClass = 'ConsoleLog';
export class ConsoleLog extends Node<ConsoleLogExecutor> {
    protected messageValue: Text;
    protected skipEmptyValue: Bool;

    get message() {
        return this.messageValue.value;
    }

    set message(value: string) {
        this.messageValue.value = value;
    }

    get defn(): NodeDefinition {
        return {
            class: ConsoleLogNodeClass,
            name: 'Console Log',
            description: 'Output a message to a console.'
        }
    }

    get designDefn(): Partial<NodeDesign> {
        return {
            color: 'rgb(200,32,32)'
        };
    }

    constructor(message: string = '') {
        super();

        this.messageValue = new Text(message);
        this.skipEmptyValue = new Bool();
        this.addValueInput<string>('message', this.messageValue, {name: 'Message'});
        this.addValueInternal<boolean>('skipEmpty', this.skipEmptyValue, {name: 'Skip Empty'});
        this.addFlowThrough();
    }

    executor(): ConsoleLogExecutor {
        if (!this.messageValue.value) {
            throw new ExecutorUndefinedInputError(this, 'message');
        }
        return new ConsoleLogExecutor(this.messageValue.value);
    }
}

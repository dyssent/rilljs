import { Node, ExecutorUndefinedInputError, NodeDefinition, NodeDesign } from '../../../../model';
import { Text } from '../../../data';
import { BrowserPromptExecutor } from './executor';

export const BrowserPromptNodeClass = 'BrowserPrompt';
export class BrowserPrompt extends Node<BrowserPromptExecutor> {
    protected message: Text;
    protected result: Text;

    get defn(): NodeDefinition {
        return {
            class: BrowserPromptNodeClass,
            name: 'Prompt Box',
            description: 'Prompt user to enter some text.'
        }
    }

    get designDefn(): Partial<NodeDesign> {
        return {
            color: 'rgb(32,128,32)'
        };
    }

    constructor(message: string = '', defaultResult: string = '') {
        super();

        this.message = new Text(message);
        this.result = new Text(defaultResult);
        this.addValueInput<string>('message', this.message, {name: 'Message'});
        this.addValueOutput<string>('result', this.result, {name: 'Result'});
        this.addFlowThrough();        
    }

    executor(): BrowserPromptExecutor {
        if (!this.message.value) {
            throw new ExecutorUndefinedInputError(this, 'message');
        }
        return new BrowserPromptExecutor(this.message.value);
    }
}

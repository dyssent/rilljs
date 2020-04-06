import { Node, NodeDefinition } from '../../../../model';
import { ExitExecutor } from './executor';

export const ExitNodeClass = 'Exit';
export class Exit extends Node<ExitExecutor> {
    get defn(): NodeDefinition {
        return {
            class: ExitNodeClass,
            name: 'Exit',
            description: 'Exit node from a subgraph execution.'
        }
    }

    constructor() {
        super();
        this.addFlowThrough(true, false);
    } 

    executor(): ExitExecutor {
        return new ExitExecutor();
    }
}

import { Node, NodeDefinition } from '../../../../model';
import { EntryExecutor } from './executor';

export const EntryNodeClass = 'Entry';
export class Entry extends Node<EntryExecutor> {
    get defn(): NodeDefinition {
        return {
            class: EntryNodeClass,
            name: 'Entry',
            description: 'Entry node into a graph execution.'
        }
    }

    constructor() {
        super();
        this.addFlowThrough(false, true);
    }    

    executor(): EntryExecutor {
        return new EntryExecutor();
    }
}

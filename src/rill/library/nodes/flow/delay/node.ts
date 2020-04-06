import { Node, NodeDefinition } from '../../../../model';
import { DelayExecutor } from './executor';

export const DelayNodeClass = 'Delay';
export class Delay extends Node<DelayExecutor> {
    get defn(): NodeDefinition {
        return {
            class: DelayNodeClass,
            name: 'Delay',
            description: 'Delay node into a subgraph execution.'
        }
    }

    executor(): DelayExecutor {
        return new DelayExecutor();
    }
}

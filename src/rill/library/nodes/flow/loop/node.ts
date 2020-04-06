import { Node, NodeDefinition } from '../../../../model';
import { LoopExecutor } from './executor';

// Iterate over an array or map of values
export const LoopNodeClass = 'Loop';
export class Loop extends Node<LoopExecutor> {
    get defn(): NodeDefinition {
        return {
            class: LoopNodeClass,
            name: 'Loop',
            description: 'Loop node into a subgraph execution.'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): LoopExecutor {
        return new LoopExecutor();
    }
}

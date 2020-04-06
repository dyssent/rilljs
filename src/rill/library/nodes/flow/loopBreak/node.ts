import { Node, NodeDefinition } from '../../../../model';
import { LoopBreakExecutor } from './executor';

// Iterate over an array or map of values
export const LoopBreakNodeClass = 'LoopBreak';
export class LoopBreak extends Node<LoopBreakExecutor> {
    get defn(): NodeDefinition {
        return {
            class: LoopBreakNodeClass,
            name: 'Loop Break',
            description: 'Loop Break breaks loop iteration.'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): LoopBreakExecutor {
        return new LoopBreakExecutor();
    }
}

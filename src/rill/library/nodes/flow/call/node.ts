import { Node, NodeDefinition } from '../../../../model';
import { CallExecutor } from './executor';

// Calls a subgraph, or another graph feeding in the data optionally
export const CallNodeClass = 'Call';
export class Call extends Node<CallExecutor> {
    get defn(): NodeDefinition {
        return {
            class: CallNodeClass,
            name: 'Call',
            description: 'Call node into a subgraph execution.'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): CallExecutor {
        return new CallExecutor();
    }
}

import { Node, NodeDefinition } from '../../../../model';
import { ConditionExecutor } from './executor';

// Single or multi node condition (e.g. boolean vs branching)
export const ConditionNodeClass = 'Condition';
export class Condition extends Node<ConditionExecutor> {
    get defn(): NodeDefinition {
        return {
            class: ConditionNodeClass,
            name: 'Condition',
            description: 'Condition node into a subgraph execution.'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): ConditionExecutor {
        return new ConditionExecutor();
    }
}

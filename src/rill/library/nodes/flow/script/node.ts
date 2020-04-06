import { Node, NodeDefinition } from '../../../../model';
import { ScriptExecutor } from './executor';

export const ScriptNodeClass = 'Script';
export class Script extends Node<ScriptExecutor> {
    get defn(): NodeDefinition {
        return {
            class: ScriptNodeClass,
            name: 'Script',
            description: 'Script'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): ScriptExecutor {
        return new ScriptExecutor();
    }
}

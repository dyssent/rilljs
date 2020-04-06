import { Node, NodeDefinition } from '../../../../model';
import { StorageExecutor } from './executor';

// Store some variables for consumption, key / value
export const StorageNodeClass = 'Storage';
export class Storage extends Node<StorageExecutor> {
    get defn(): NodeDefinition {
        return {
            class: StorageNodeClass,
            name: 'Storage',
            description: 'Storage'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): StorageExecutor {
        return new StorageExecutor();
    }
}

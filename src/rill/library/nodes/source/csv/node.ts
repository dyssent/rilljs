import { Node, NodeDefinition } from '../../../../model';
import { CSVExecutor } from './executor';

// Iterate over an array or map of values
export const CSVNodeClass = 'CSVReader';
export class CSV extends Node<CSVExecutor> {
    get defn(): NodeDefinition {
        return {
            class: CSVNodeClass,
            name: 'CSV',
            description: 'CSV'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): CSVExecutor {
        return new CSVExecutor();
    }
}

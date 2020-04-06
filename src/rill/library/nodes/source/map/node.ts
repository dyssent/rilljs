import { Node, NodeDefinition } from '../../../../model';
import { MapExecutor } from './executor';

// Map data from one format into another
export const MapNodeClass = 'Map';
export class Map extends Node<MapExecutor> {
    get defn(): NodeDefinition {
        return {
            class: MapNodeClass,
            name: 'Map',
            description: 'Map'
        }
    }

    /**
     * Enum: Boolean or Branching
     */

    executor(): MapExecutor {
        return new MapExecutor();
    }
}

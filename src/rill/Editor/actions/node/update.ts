import { Node } from '../../../model';
import { Action } from '../action';

export interface UpdateNode extends Action {
    type: 'UpdateNode';    
    node: Node;
}

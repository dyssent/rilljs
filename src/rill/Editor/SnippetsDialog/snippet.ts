import { ModelChunkJSON } from '../utils';

export interface Snippet {
    id: string;
    name: string;
    description: string;
    chunk: ModelChunkJSON;
}

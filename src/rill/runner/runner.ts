import { Graph } from '../model';

export class Runner {
    protected graph: Graph;

    constructor(graph: Graph) {
        this.graph = graph;
    }
}
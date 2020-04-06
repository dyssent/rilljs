import { Node, NodeDefinition } from '../../../../model';
import { ParallelExecutor } from './executor';
import { RNumber, numberSanitizer } from '../../../data';

export const ParallelNodeClass = 'Parallel';
export class Parallel extends Node<ParallelExecutor> {
    protected branchesValue: RNumber;

    get branches() {
        return this.branchesValue.value;
    }

    set branches(value: number) {
        this.branchesValue.value = value;
    }

    get defn(): NodeDefinition {
        return {
            class: ParallelNodeClass,
            name: 'Parallel',
            description: 'Execute multiple branches in parallel.'
        }
    }

    constructor(branches: number = 1) {
        super();

        this.onBranchesChange = this.onBranchesChange.bind(this);
        this.branchesValue = new RNumber(branches);
        this.addValueInternal('branches', this.branchesValue, {
            name: 'Branches Out',
            onChange: this.onBranchesChange,
            sanitize: numberSanitizer({
                min: 0,
                max: 20,
                integer: true
            }),
            help: (v: number) => v >= 5 ? '(ideally, under 5)' : undefined
        });
        this.addFlowThrough(true, false);
        this.updateOutputs(branches);
    }

    public getOutputName(index: number): string {
        return `out_${index + 1}`;
    }

    protected updateOutputs(num: number) {
        const currentLength = this.flowOut.length;
        // Remove those that we no longer have
        for (let i = num; i < currentLength; i++) {
            this.removeFlowOutput(this.getOutputName(i));
        }
        // Add new ones
        for (let i = this.flowOut.length; i < num; i++) {
            this.addFlowOutput(this.getOutputName(i), `${i + 1}`);
        }
    }

    protected onBranchesChange(before: number, after: number): number {
        this.updateOutputs(after);
        return after;
    }

    executor(): ParallelExecutor {
        return new ParallelExecutor();
    }
}

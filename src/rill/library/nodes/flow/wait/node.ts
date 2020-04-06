import { Node, NodeDefinition } from '../../../../model';
import { WaitExecutor } from './executor';
import { RNumber, numberSanitizer } from '../../../data';

export const WaitNodeClass = 'Wait';
export class Wait extends Node<WaitExecutor> {
    protected branchesValue: RNumber;

    get branches() {
        return this.branchesValue.value;
    }

    set branches(value: number) {
        this.branchesValue.value = value;
    }

    get defn(): NodeDefinition {
        return {
            class: WaitNodeClass,
            name: 'Wait',
            description: 'Wait for all inputs to complete.'
        }
    }

    constructor(branches: number = 1) {
        super();

        this.onBranchesChange = this.onBranchesChange.bind(this);
        this.branchesValue = new RNumber(branches);
        this.addValueInternal('inputs', this.branchesValue, {
            name: 'Wait Inputs',
            onChange: this.onBranchesChange,
            sanitize: numberSanitizer({
                min: 0,
                max: 20,
                integer: true,
            }),
            help: (v: number) => v >= 5 ? '(ideally, under 5)' : undefined
        });
        this.addFlowThrough(false, true);
        this.updateInputs(branches);
    }

    public getInputName(index: number): string {
        return `in_${index + 1}`;
    }

    protected updateInputs(num: number) {
        const currentLength = this.flowIn.length;
        // Remove those that we no longer have
        for (let i = num; i < currentLength; i++) {
            this.removeFlowInput(this.getInputName(i));
        }
        // Add new ones
        for (let i = this.flowIn.length; i < num; i++) {
            this.addFlowInput(this.getInputName(i), `${i + 1}`);
        }
    }

    protected onBranchesChange(before: number, after: number): void {
        this.updateInputs(after);
    }

    executor(): WaitExecutor {
        return new WaitExecutor();
    }
}

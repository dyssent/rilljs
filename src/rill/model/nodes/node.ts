import { InputValue, InputFlow } from './input';
import { OutputValue, OutputFlow } from './output';
import { Datum } from '../data';
import { Executor } from '../executor';
import { newID } from '../utils';
import {
    NodeInvalidSerializedTypeError,
    NodeInputAlreadyExistsError,
    NodeOutputAlreadyExistsError,
    NodeInputDoesntExistError,
    NodeOutputDoesntExistError
} from './error';
import { NodeDesign } from '../design';
import { IOValueConfig, IOValue } from './value';
import { Graph } from '../graph';

export interface NodeDefinition {
    class: string;
    name?: string;
    description?: string;
}

export interface NodeExecutor<E extends Executor> {
    executor: () => E;
}

export interface INode<E extends Executor> extends NodeExecutor<E> {
    defn: NodeDefinition;
    designDefn: Partial<NodeDesign> | undefined;

    validate(graph: Graph): string | undefined;
    toJSON(): NodeJSON;
    fromJSON(data: NodeJSON): void;
}

export type NodeConstructor = { new (): Node };

export interface NodeJSON {
    class: string;
    id: string;
    name?: string;
    inputs: {[key: string]: unknown};
    outputs: {[key: string]: unknown};
    internal: {[key: string]: unknown};
}

export abstract class Node<E extends Executor = Executor> implements INode<E> {
    abstract get defn(): NodeDefinition;
    abstract executor(): E;

    get designDefn(): Partial<NodeDesign> | undefined {
        return undefined;
    }

    nodeID: string;
    nodeName?: string;

    protected inputs: InputValue[];
    protected outputs: OutputValue[];
    protected flowIn: InputFlow[];
    protected flowOut: OutputFlow[];
    protected internal: IOValue[];

    constructor() {
        this.nodeID = newID();
        this.inputs = [];
        this.outputs = [];
        this.flowIn = [];
        this.flowOut = [];
        this.internal = [];
    }

    static readonly defaultFlowThroughInputID = 'in';
    static readonly defaultFlowThroughOutputID = 'out';

    protected addFlowThrough(flowIn: boolean = true, flowOut: boolean = true) {
        if (flowIn) {
            this.addFlowInput(Node.defaultFlowThroughInputID, 'In');
        }
        if (flowOut) {
            this.addFlowOutput(Node.defaultFlowThroughOutputID, 'Out');
        }
    }

    validate(graph: Graph): string | undefined {
        return undefined;
    }

    getFlowInputs(): InputFlow[] {
        return this.flowIn;
    }

    getFlowInputUnsafe(id: string): InputFlow | undefined {
        return this.flowIn.find(f => f.id === id);
    }

    getFlowInput(id: string): InputFlow {
        const res = this.getFlowInputUnsafe(id);
        if (!res) {
            throw new NodeInputDoesntExistError(id, this);
        }
        return res;
    }

    getFlowOutputs(): OutputFlow[] {
        return this.flowOut;
    }

    getFlowOutputUnsafe(id: string): InputFlow | undefined {
        return this.flowOut.find(f => f.id === id);
    }

    getFlowOutput(id: string): InputFlow {
        const res = this.getFlowOutputUnsafe(id);
        if (!res) {
            throw new NodeOutputDoesntExistError(id, this);
        }
        return res;
    }

    getValueInputs(): InputValue[] {
        return this.inputs;
    }

    getValueInternalUnsafe(id: string): IOValue | undefined {
        return this.internal.find(f => f.id === id);
    }

    getValueInternal(id: string): IOValue {
        const res = this.getValueInternalUnsafe(id);
        if (!res) {
            throw new NodeInputDoesntExistError(id, this);
        }
        return res;
    }

    getValueInternals(): IOValue[] {
        return this.internal;
    }

    protected addValueInternal<DT, T extends Datum<DT> = Datum<DT>>(id: string, value: T, config?: IOValueConfig<DT>) {
        if (this.internal.find(i => i.id === id)) {
            throw new NodeInputAlreadyExistsError(id, this);
        }

        const internal = {
            value,
            id,
            config: config || {}
        };

        this.internal.push(internal as IOValue<unknown, Datum<unknown>>);
        return internal;
    }

    getValueInputUnsafe(id: string): InputValue | undefined {
        return this.inputs.find(f => f.id === id);
    }

    getValueInput(id: string): InputValue {
        const res = this.getValueInputUnsafe(id);
        if (!res) {
            throw new NodeInputDoesntExistError(id, this);
        }
        return res;
    }

    getValueOutputs(): OutputValue[] {
        return this.outputs;
    }

    getValueOutputUnsafe(id: string): OutputValue | undefined {
        return this.outputs.find(f => f.id === id);
    }

    getValueOutput(id: string): OutputValue {
        const res = this.getValueOutputUnsafe(id);
        if (!res) {
            throw new NodeOutputDoesntExistError(id, this);
        }
        return res;
    }

    protected addValueInput<DT, T extends Datum<DT> = Datum<DT>>(id: string, value: T, config?: IOValueConfig<DT>) {
        if (this.inputs.find(i => i.id === id)) {
            throw new NodeInputAlreadyExistsError(id, this);
        }

        const input = {
            value,
            id,
            config: config || {}
        };
        this.inputs.push(input as InputValue<unknown, Datum<unknown>>);
        return input;
    }

    protected addValueOutput<DT, T extends Datum<DT> = Datum<DT>>(id: string, value: T, config?: IOValueConfig<DT>) {
        if (this.outputs.find(i => i.id === id)) {
            throw new NodeOutputAlreadyExistsError(id, this);
        }

        const output = {
            value,
            id,
            config: config || {}
        };
        this.outputs.push(output as OutputValue<unknown, Datum<unknown>>);
        return output;
    }

    protected addFlowInput(id: string, name: string = 'In') {
        if (this.flowIn.find(i => i.id === id)) {
            throw new NodeInputAlreadyExistsError(id, this);
        }
        const flowIn = {
            id,
            name
        };
        this.flowIn.push(flowIn);
        return flowIn;
    }

    protected removeFlowInput(id: string) {
        this.flowIn = this.flowIn.filter(i => i.id !== id);
    }

    protected addFlowOutput(id: string, name: string = 'Out') {
        if (this.flowOut.find(i => i.id === id)) {
            throw new NodeOutputAlreadyExistsError(id, this);
        }
        const flowOut = {
            id,
            name
        };
        this.flowOut.push(flowOut);
        return flowOut;
    }

    protected removeFlowOutput(id: string) {
        this.flowOut = this.flowOut.filter(i => i.id !== id);
    }

    toJSON(): NodeJSON {
        return this.toJSONImpl();
    }

    protected toJSONImpl(): NodeJSON {
        const inputs: {[key: string]: unknown} = {};
        const outputs: {[key: string]: unknown} = {};
        const internal: {[key: string]: unknown} = {};

        const valueToJSON = (iov: IOValue, dest: {[key: string]: unknown}) => {
            if (typeof iov.value === 'undefined') {
                return;
            }
            dest[iov.id] = iov.value.toJSON();
        };
        this.inputs.forEach(i => {
            valueToJSON(i, inputs);
        });

        this.outputs.forEach(i => {
            valueToJSON(i, outputs);
        });

        this.internal.forEach(i => {
            valueToJSON(i, internal);
        });

        return {
            id: this.nodeID,
            name: this.nodeName,
            class: this.defn.class,
            inputs,
            outputs,
            internal
        }
    }

    fromJSON(data: NodeJSON): void {
        if (data.class !== this.defn.class) {
            throw new NodeInvalidSerializedTypeError(this.defn.class, data);
        }

        this.nodeID = data.id;
        this.nodeName = data.name;
        this.inputs.forEach(i => {
            i.value.value = i.value.ctor.fromJSON(data.inputs[i.id]);
        });
        this.outputs.forEach(i => {
            i.value.value = i.value.ctor.fromJSON(data.outputs[i.id]);
        });
        this.internal.forEach(i => {
            i.value.value = i.value.ctor.fromJSON(data.internal[i.id]);
        });
    }
}

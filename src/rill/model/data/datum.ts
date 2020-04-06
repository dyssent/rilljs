
export interface DatumDefinition {
    id: string;
    name?: string;
    description?: string;
}

export interface DatumSerializer<VTS = unknown> {
    toJSON(): VTS;
}

export type DatumConstructor<VT = unknown, VTS = unknown> = {
    new (value: VT): Datum<VT>,
    readonly defn: DatumDefinition,
    fromJSON: (value: VTS) => VT
};

export abstract class Datum<VT = unknown, VTS = unknown> implements DatumSerializer {
    value: VT;

    abstract get defn(): DatumDefinition;
    abstract get ctor(): DatumConstructor<VT>;
    abstract toJSON(): VTS;
    // static fromJSON(value: unknown): Datum<VT> {
    //     throw new Error(`Not implemented`);
    // }

    constructor(value: VT) {
        this.value = value;
    }
}

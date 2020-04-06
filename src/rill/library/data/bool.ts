import { Datum, DatumInvalidTypeError, DatumDefinition } from '../../model';

export const BoolTypeID = 'bool';
export class Bool extends Datum<boolean> {
    static readonly defn: DatumDefinition = {
        id: BoolTypeID,
        name: 'Boolean',
        description: 'Boolean value, true or false.'
    }

    get defn(): DatumDefinition {
        return Bool.defn;
    }

    get ctor() {
        return Bool;
    }

    constructor(value: boolean = false) {
        super(value);
    }

    toJSON() {
        return this.value;
    }

    static fromJSON(value: unknown): boolean {
        switch (typeof(value)) {
            case 'boolean':
                return value;

            default:
                throw new DatumInvalidTypeError('boolean', value);
        }
    }
}

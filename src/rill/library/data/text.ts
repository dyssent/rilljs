import { Datum, DatumInvalidTypeError, DatumDefinition } from '../../model';

export const TextTypeID = 'text';
export class Text extends Datum<string> {
    static readonly defn: DatumDefinition = {
        id: TextTypeID,
        name: 'Text',
        description: 'Text, any length.'
    }

    get defn(): DatumDefinition {
        return Text.defn;
    }

    get ctor() {
        return Text;
    }

    toJSON() {
        return this.value;
    }

    static fromJSON(value: unknown): string {
        switch (typeof(value)) {
            case 'string':
                return value;

            default:
                throw new DatumInvalidTypeError('string', value);
        }
    }
}

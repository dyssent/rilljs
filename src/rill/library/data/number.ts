import { Datum, DatumInvalidTypeError, DatumDefinition } from '../../model';

export const NumberTypeID = 'number';
export class RNumber extends Datum<number> {
    static readonly defn: DatumDefinition = {
        id: NumberTypeID,
        name: 'Number',
        description: 'Just a number, either integer or with a floating point.'
    }

    get defn(): DatumDefinition {
        return RNumber.defn;
    }

    get ctor() {
        return RNumber;
    }

    toJSON() {
        return this.value;
    }

    static fromJSON(value: unknown): number {
        switch (typeof(value)) {
            case 'number':
                return value;

            default:
                throw new DatumInvalidTypeError('number', value);
        }
    }
}

export function numberSanitizer(rules: {
    min?: number,
    max?: number,
    integer?: boolean
}) {
    return (value: number) => {
        let adjusted = value;
        if (typeof rules.min !== 'undefined' && adjusted < rules.min) {
            adjusted = rules.min;
        }
        if (typeof rules.max !== 'undefined' && adjusted > rules.max) {
            adjusted = rules.max;
        }
        if (typeof rules.integer) {
            adjusted = Math.floor(adjusted);
        }
        return adjusted;
    };
}

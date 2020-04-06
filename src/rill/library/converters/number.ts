import {
    ConverterFrom,
    ConverterTo,
    ConverterRuntimeConvertToFailure,
    ConverterRuntimeConvertFromFailure
} from '../../model';
import {
    TextTypeID,
    NumberTypeID,
    BoolTypeID
} from '../data';

export const numberConverter: ConverterFrom<number, boolean | string> & ConverterTo<number, boolean | string> = {
    baseType: NumberTypeID,

    fromTypes: [
        BoolTypeID,
        TextTypeID
    ],

    toTypes: [
        BoolTypeID,
        TextTypeID
    ],

    convertFrom: (from: boolean | string, typeID: string): number => {
        switch (typeID) {
            case BoolTypeID: {
                if (typeof from !== 'boolean') {
                    throw new ConverterRuntimeConvertFromFailure(NumberTypeID, typeID, `Expected string got ${typeof from}`);
                }
                return from ? 1 : 0;
            }

            case TextTypeID:
                if (typeof from !== 'string') {
                    throw new ConverterRuntimeConvertFromFailure(NumberTypeID, typeID, `Expected string got ${typeof from}`);
                }

                const asNumber = parseFloat(from);
                if (isNaN(asNumber)) {
                    throw new ConverterRuntimeConvertFromFailure(NumberTypeID, typeID, `Unexpected number in value '${from}'`);
                }
                return asNumber;                

            
            default:
                throw new ConverterRuntimeConvertFromFailure(NumberTypeID, typeID, `Unsupported type id`);
        }
    },

    convertTo: (value: number, typeID: string): boolean | string => {
        switch (typeID) {
            case BoolTypeID:
                return value !== 0;

            case TextTypeID:
                return value.toString();

            default:
                    throw new ConverterRuntimeConvertToFailure(NumberTypeID, typeID, `Unsupported type id`);                
        }
    }
};

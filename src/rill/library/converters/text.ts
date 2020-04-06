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

export const textConverter: ConverterFrom<string, boolean | number> & ConverterTo<string, boolean | number> = {
    baseType: TextTypeID,

    fromTypes: [
        BoolTypeID,
        NumberTypeID
    ],

    toTypes: [
        BoolTypeID,
        NumberTypeID
    ],

    convertFrom: (from: boolean | number, typeID: string): string => {
        switch (typeID) {
            case BoolTypeID: {
                if (typeof from !== 'boolean') {
                    throw new ConverterRuntimeConvertFromFailure(TextTypeID, typeID, `Expected string got ${typeof from}`);
                }
                return from ? 'true' : 'false';
            }
                
            case NumberTypeID:
                if (typeof from !== 'number') {
                    throw new ConverterRuntimeConvertFromFailure(TextTypeID, typeID, `Expected string got ${typeof from}`);
                }
                return from.toString();
            
            default:
                throw new ConverterRuntimeConvertFromFailure(TextTypeID, typeID, `Unsupported type id`);
        }
    },

    convertTo: (value: string, typeID: string): boolean | number => {
        switch (typeID) {
            case BoolTypeID:
                const vl = value.toLowerCase();
                return vl === 'true' || vl === '1' ? true : false;

            case NumberTypeID:
                const asNumber = parseFloat(value);
                if (isNaN(asNumber)) {
                    throw new ConverterRuntimeConvertToFailure(TextTypeID, typeID, `Unexpected number in value '${value}'`);
                }
                return asNumber;

            default:
                    throw new ConverterRuntimeConvertToFailure(TextTypeID, typeID, `Unsupported type id`);                
        }
    }
};

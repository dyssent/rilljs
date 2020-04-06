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

export const boolConverter: ConverterFrom<boolean, string | number> & ConverterTo<boolean, string | number> = {
    baseType: BoolTypeID,

    fromTypes: [
        TextTypeID,
        NumberTypeID
    ],

    toTypes: [
        TextTypeID,
        NumberTypeID
    ],

    convertFrom: (from: string | number, typeID: string): boolean => {
        switch (typeID) {
            case TextTypeID: {
                if (typeof from !== 'string') {
                    throw new ConverterRuntimeConvertFromFailure(BoolTypeID, typeID, `Expected string got ${typeof from}`);
                }
                const fl = from.toLowerCase();
                return fl === 'true' || fl === '1' ? true : false;
            }
                
            case NumberTypeID:
                if (typeof from !== 'number') {
                    throw new ConverterRuntimeConvertFromFailure(BoolTypeID, typeID, `Expected string got ${typeof from}`);
                }
                return from !== 0;
            
            default:
                throw new ConverterRuntimeConvertFromFailure(BoolTypeID, typeID, `Unsupported type id`);
        }
    },

    convertTo: (value: boolean, typeID: string): string | number => {
        switch (typeID) {
            case TextTypeID:
                return value ? 'true' : 'false';

            case NumberTypeID:
                return value ? 1 : 0;

            default:
                    throw new ConverterRuntimeConvertToFailure(BoolTypeID, typeID, `Unsupported type id`);                
        }
    }
};

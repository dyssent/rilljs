import { Bool } from './bool';
import { Text } from './text';
import { RNumber } from './number';
import { DatumConstructor } from '../../model';

export * from './bool';
export * from './number';
export * from './text';

export const BuiltinDataTypes: DatumConstructor<any>[] = [
    Bool,
    Text,
    RNumber
];

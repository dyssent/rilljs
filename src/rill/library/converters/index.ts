import { boolConverter } from './bool';
import { numberConverter } from './number';
import { textConverter } from './text';
import { ConverterFrom, ConverterTo } from '../../model';

export * from './bool';
export * from './text';

export const BuiltinConverters = [
    boolConverter,
    numberConverter,
    textConverter
] as unknown as Array<ConverterFrom<unknown, unknown> & ConverterTo<unknown, unknown>>;

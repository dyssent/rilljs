import { Registry } from './registry';
import { BuiltinNodeTypes, BuiltinDataTypes } from '../../library';

export const defaultRegistry = new Registry(
    BuiltinNodeTypes,
    BuiltinDataTypes
);

export abstract class DataError extends Error {
}

export class DatumInvalidTypeError extends DataError {
    value: unknown;
    constructor(expected: string, value: unknown) {
        super(`Expected type ${expected}, while received type ${typeof (value)}`);
        this.value = value;
    }
}

export class ConverterRuntimeConvertToFailure extends DataError {
    constructor(baseType: string, toType: string, error: unknown) {
        super(`Unexpected runtime failure in converter: ${baseType}, during conversion to ${toType}. Error: ${error}`);
    }
}

export class ConverterRuntimeConvertFromFailure extends DataError {
    constructor(baseType: string, fromType: string, error: unknown) {
        super(`Unexpected runtime failure in converter: ${baseType}, during conversion from ${fromType}. Error: ${error}`);
    }
}

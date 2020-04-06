
export interface ConverterFrom<CV = unknown, FV = unknown, M = unknown> {
    baseType: string;
    fromTypes: string | string[];

    /**
     * convertFrom is called to convert from type F to type T
     * with an optinal parameter meta of type C; Meta can be
     * used to provide some extra configuration, which makes
     * the conversion possible. For example, from a free form
     * JSON, it can be used to define a selector from where to
     * take the actual data, in other cases can be used as an array
     * index, and such.
     */
    convertFrom: (from: FV, typeID: string, meta?: M) => CV;
}

export interface ConverterTo<CV = unknown, TV = unknown, M = unknown> {
    baseType: string;
    toTypes: string | string[];

    /**
     * convertTo works similarly, but convers the opposite way,
     * from the value we need to the value we want.
     */
    convertTo: (value: CV, typeID: string, meta?: M) => TV;
}

import { Datum, DatumConstructor } from '../data';

export interface IOValueConfig<DT = unknown> {
    /**
     * User friendly name for the value.
     */
    name?: string;
    /**
     * Descrioption of what the input is for.
     * Optional
     */
    description?: string | ((value: DT) => string | undefined);
    /**
     * Helper text, by default we show nothing, but this can be used
     * to provide meaningful text for the current value. For example,
     * can be used to pull our a name by ID, or can be used to simply
     * provide some helpful text.
     */
    help?: string | ((value: DT) => string | undefined);

    /**
     * Sanitize is called each time a value is about to change,
     * this can be used to adjust values as needed for a particular
     * input.
     */
    sanitize?: (value: DT) => DT;

    /**
     * onChange is called each time a value is to be updated.
     * This can be used to restrict certain values, or perform
     * changes to other values if needed.
     */    
    onChange?: (before: DT, after: DT) => void;
}

export interface IOValue<DT = unknown, T extends Datum<DT> = Datum<DT>> {
    id: string;
    value: T;
    config: IOValueConfig<DT>;
}

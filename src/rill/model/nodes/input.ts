import { Datum } from '../data';
import { IOValue } from './value';
import { IOFlow } from './flow';

export type InputValue<DT = unknown, T extends Datum<DT> = Datum<DT>> = IOValue<DT, T>;
export type InputFlow = IOFlow;

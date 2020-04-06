import { Datum } from '../data';
import { IOValue } from './value';
import { IOFlow } from './flow';

export type OutputValue<DT = unknown, T extends Datum<DT> = Datum<DT>> = IOValue<DT, T>;
export type OutputFlow = IOFlow;

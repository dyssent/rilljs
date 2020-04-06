import { Datum, IOValue, Node } from '../../model';
import { ModelActions } from '../model';
import { Options } from '../options';
import { Theme } from '../theme';

export interface DataDrawerProps<DT = unknown, T extends Datum<DT> = Datum<DT>> {
    value: T;

    node: Node;
    actions: ModelActions;
    options: Options;
    theme: Theme;

    onValueChange: (value: DT) => void;
}

export interface ValueDrawerProps<DT = unknown, T extends Datum<DT> = Datum<DT>> {
    value: IOValue<DT, T>;
    node: Node;

    actions: ModelActions;
    options: Options;
    theme: Theme;
}

export interface NodeDrawerProps<T extends Node = Node> {
    node: T;
    actions: ModelActions;
    options: Options;
    invalid?: string;
    theme: Theme;
}

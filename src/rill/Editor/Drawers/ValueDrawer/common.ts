import { useMemo } from 'react';

import { Datum, IOValue, Node } from '../../../model';
import { ModelActions } from '../../model';

export function handleDatumValueChange<DT, T extends Datum<DT>>(v: IOValue<DT, T>, actions: ModelActions, node: Node, onUpdated?: () => void) {
    return (value: DT) => {
        const sanitized = v.config.sanitize ? v.config.sanitize(value) : value;

        actions.beginNodeEdit(node);
        const before = v.value.value;
        const after = sanitized;

        v.value.value = after;
        
        if (v.config.onChange) {
            try {
                v.config.onChange(before, after);
            } catch (e) {
                console.warn(`Unexpected error during node value ${v.id} onChange: ${JSON.stringify(e)}`);
                actions.cancelNodeEdit();
                return;
            }
        }
        actions.finishNodeEdit();
        if (onUpdated) {
            onUpdated();
        }
    };
}

export function useControlGroupLabels<DT = unknown, T extends Datum<DT> = Datum<DT>>(val: IOValue<DT, T>) {
    const config = val.config;
    const value = val.value;

    return useMemo(() => {
        const labelHelp = config.help ?
            typeof config.help === 'string' ? config.help : config.help(value.value)
            : undefined;
        const help = config.description ?
            typeof config.description === 'string' ? config.description : config.description(value.value)
            : undefined;
        const label = config.name || val.id;
        return {
            label,
            labelHelp,
            help
        };
    }, [value, config, val.id]);
}

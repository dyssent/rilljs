import React, { useState } from 'react';

import { ControlGroup } from '../../Components';
import { Datum, Node } from '../../../model';
import { useControlGroupLabels, handleDatumValueChange } from './common';
import { ModelActions } from '../../model';
import { Options } from '../../options';
import { Theme } from '../../theme';
import { ValueDrawerProps } from '../props';

export function drawDatum<DT, T extends Datum<DT>>(
    v: T,
    vid: string | number,
    onValueChange: (value: DT) => void,
    node: Node,
    actions: ModelActions,
    options: Options,
    theme: Theme
) {
    const DataDrawer = options.drawers.data[v.defn.id];
    if (!DataDrawer) {
        if (options.debug) {
            return (
                <span
                    className={theme.classes.textDebug}
                >
                    No drawer for data type <b>{v.defn.id}</b>.
                </span>
            );
        }
        return null;
    }

    return (
        <DataDrawer
            key={vid}
            value={v as any}
            node={node}
            actions={actions}
            options={options}
            theme={theme}
            onValueChange={onValueChange as (value: unknown) => void}
        />                            
    );
}

export function ValueDrawer<DT, T extends Datum<DT>>(props: ValueDrawerProps<DT, T>) {
    const {
        node,
        actions,
        options,
        theme,
        value,
        // onValueChange
    } = props;

    const [, redraw] = useState({});

    const {
        label,
        labelHelp,
        help
    } = useControlGroupLabels(value);

    const changeHandler = handleDatumValueChange<DT, T>(value, actions, node, () => redraw({}));

    return (
        <ControlGroup
            label={label}
            help={help}
            labelHelp={labelHelp}
        >
            {
                drawDatum<DT, T>(value.value, value.id, changeHandler, node, actions, options, theme)
            }
        </ControlGroup>
    );    
}
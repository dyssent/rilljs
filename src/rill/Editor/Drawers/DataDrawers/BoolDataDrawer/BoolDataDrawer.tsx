import React, { useState } from 'react';

import { Switch } from '../../../Components';
import { Bool } from '../../../../library';
import { DataDrawerProps } from '../../props';

export interface BoolDataDrawerProps extends DataDrawerProps<boolean, Bool> {
}

export function BoolDataDrawer(props: BoolDataDrawerProps) {
    const {
        value,
        theme,
        onValueChange
    } = props;

    const [, redraw] = useState({});

    function onChange(event: React.FormEvent<HTMLInputElement>) {
        const v = event.currentTarget.checked;
        onValueChange(v);
        redraw({});
    }

    // const {
    //     label,
    //     labelHelp,
    //     help
    // } = useControlGroupLabels(value);
    const label = 'Bool';
    const help = 'help';
    const labelHelp = 'labelHelp';

    return (
        <>
            <Switch
                label={label}
                checked={value.value}
                onChange={onChange}
            />
            {
                (help || labelHelp) &&
                <div className={theme.classes.help}>
                    {labelHelp}
                    {help}
                </div>
            }
        </>
    );    
}

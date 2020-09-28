import React, { useState } from 'react';

import { InputField } from '../../../Components';
import { RNumber } from '../../../../library';
import { DataDrawerProps } from '../../props';

export interface NumberDataDrawerProps extends DataDrawerProps<number, RNumber> {
}

export function NumberDataDrawer(props: NumberDataDrawerProps) {
    const {
        value,
        onValueChange,
        options
    } = props;

    const { readonly } = options;
    const [, redraw] = useState({});

    function onChange(event: React.FormEvent<HTMLInputElement>) {
        let v = +event.currentTarget.value;
        if (isNaN(v)){
            v = 0;
        }
        onValueChange(v);
        redraw({});
    }

    return (
        <InputField
            type="text"
            value={value.value}
            onChange={onChange}
            disabled={readonly}
        />
    );    
}
import React, { useContext, useMemo } from 'react';

import { BaseProps } from '../props';
import { mergeClasses } from '../utils';
import { Theme, ThemeContext } from '../../theme';

export interface ControlProps extends BaseProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    inline?: boolean;
    label?: React.ReactNode;
    indicatorChildren?: React.ReactNode;

    typeClassName?: string;
    type?: 'checkbox' | 'radio';

    onChange?: React.FormEventHandler<HTMLInputElement>;
}

export function Control(props: ControlProps) {
    const {
        checked,
        defaultChecked,
        disabled,
        inline,
        label,
        className,
        style,
        typeClassName,
        indicatorChildren,
        type = 'checkbox',
        onChange
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const classes = useMemo(() => {
        return mergeClasses(
            theme.controls.control,
            typeClassName,
            {
                [theme.inline]: inline,
                [theme.disabled]: disabled
            },
            className

        );
    }, [theme, typeClassName, disabled, inline, className]);

    return (
        <label
            className={classes}
            style={style}
        >
            <input
                type={type}
                checked={checked}
                defaultChecked={defaultChecked}
                onChange={onChange}
                disabled={disabled}
            />
            <span className={theme.controls.indicator}>
                {
                    indicatorChildren
                }
            </span>
            {label}
        </label>
    );
}

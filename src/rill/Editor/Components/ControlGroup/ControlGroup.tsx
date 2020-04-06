import React, { useMemo, useContext } from 'react';

import { BaseProps } from '../props';
import { mergeClasses } from '../utils';
import { Theme, ThemeContext } from '../../theme';

export interface ControlGroupProps extends BaseProps {
    label?: React.ReactNode;
    labelHelp?: React.ReactNode;
    labelFor?: string;
    inline?: boolean;
    fill?: boolean;
    help?: React.ReactNode;
    disabled?: boolean;
}

export function ControlGroup(props: React.PropsWithChildren<ControlGroupProps>) {
    const {
        label,
        labelHelp,
        labelFor,
        inline,
        help,
        fill,
        disabled,
        className,
        style,
        children
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const classes = useMemo(() => {
        return mergeClasses(
            theme.controlGroup,
            {
                [theme.disabled]: disabled,
                [theme.inline]: inline,
                [theme.fill]: fill
            },
            className
        );
    }, [disabled, inline, className, theme]);

    return (
        <div
            className={classes}
            style={style}
        >
                {
                    label &&
                    <label
                        className={theme.label}
                        htmlFor={labelFor}
                    >
                        {label} <span className={theme.textMuted}>{labelHelp}</span>
                    </label>
                }
                <div>
                    {children}
                    {
                        help &&
                        <div className={theme.help}>
                            {help}
                        </div>
                    }
                </div>
        </div>
    );
}

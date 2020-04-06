import React, { useContext } from 'react';
import { mergeClasses } from '../utils';
import { Theme, ThemeContext } from '../../theme';
import { BaseProps } from '../props';
import { IconName } from '../Icons';
import { Icon } from '../Icon';

export interface ButtonProps extends BaseProps {
    icon?: IconName | React.ReactNode;
    active?: boolean;
    fill?: boolean;
    disabled?: boolean;
    text?: string;
    title?: string;
    onClick?: (event: React.MouseEvent) => void;
}

export function Button(props: React.PropsWithChildren<ButtonProps>) {
    const {
        icon,
        active,
        fill,
        disabled,
        children,
        text,
        className,
        style,
        title,
        onClick
    } = props;

    const theme = useContext<Theme>(ThemeContext);
    const classes = mergeClasses(
        theme.classes.button,
        {
            [theme.classes.active]: active,
            [theme.classes.disabled]: disabled,
            [theme.classes.fill]: fill
        },
        className
    );

    return (
        <button
            type="button"
            className={classes}
            style={style}
            onClick={onClick}
            title={title}
        >
            {
                icon &&
                <Icon icon={icon} />
            }
            {
                (text || children) &&
                <span key="text" className={theme.classes.buttonText}>
                    {children}
                </span>
            }                
        </button>        
    );
}

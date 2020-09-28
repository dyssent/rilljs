import React, { useContext, CSSProperties } from 'react';
import { Theme, ThemeContext } from '../../theme';
import { mergeClasses } from '../utils';
import { IconName } from '../Icons';
import { Icon } from '../Icon';

export interface MenuItemProps {
    style?: CSSProperties;
    className?: string;
    icon?: IconName;
    text?: string;

    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const MenuItem = React.memo((props: React.PropsWithChildren<MenuItemProps>) => {
    const {
        style,
        className,
        onClick,
        icon,
        text,
        children
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes.menu;
    const classes = mergeClasses(theme.item, className);
    return (
        <li>
            <div
                onClick={onClick}
                className={classes}
                style={style}
            >
                {
                    icon &&
                    <Icon icon={icon} />
                }
                {
                    text &&
                    <span>
                        {text}
                    </span>                    
                }
                {children}
            </div>
        </li>
    );
});

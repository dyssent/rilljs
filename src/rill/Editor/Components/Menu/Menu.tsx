import React, { useContext, CSSProperties } from 'react';
import { Theme, ThemeContext } from '../../theme';
import { mergeClasses } from '../utils';

export interface MenuProps {
    style?: CSSProperties;
    className?: string;
    menuRef?: React.RefObject<HTMLUListElement>;
}

export const Menu = React.memo((props: React.PropsWithChildren<MenuProps>) => {
    const {
        style,
        className,
        children,
        menuRef
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes.menu;
    const classes = mergeClasses(theme.container, className);
    return (
        <ul
            className={classes}
            style={style}
            ref={menuRef}
        >
            {
                children
            }
        </ul>
    );
});

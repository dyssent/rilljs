import React, { useContext, CSSProperties } from 'react';
import { Theme, ThemeContext } from '../../theme';
import { mergeClasses } from '../utils';

export interface DividerProps {
    style?: CSSProperties;
    className?: string;
}

export const Divider = React.memo((props: DividerProps) => {
    const {
        style,
        className
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes.menu;
    const classes = mergeClasses(theme.divider, className);
    return (
        <li
            className={classes}
            style={style}
        />
    );
});

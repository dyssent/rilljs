import React, { useContext } from 'react';

import { Rect } from '../model';
import { Theme, ThemeContext } from './theme';
import { BaseProps, mergeClasses } from './Components';

export interface GridProps extends BaseProps {
    rect: Rect;
}

export function Lasso(props: React.PropsWithChildren<GridProps>) {
    const {
        rect,
        className,
        style
    } = props;

    const theme = useContext<Theme>(ThemeContext).canvas.lasso;

    return (
        <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            className={mergeClasses(className, theme)}
            style={style}
        />
    );
}

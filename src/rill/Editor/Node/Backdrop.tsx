import React, { useContext } from 'react';

import { Theme, ThemeContext } from '../theme';

export interface BackdropProps {
    width: number;
    height: number;
    onMouseDown?: (event: React.MouseEvent<Element>) => void;
}

export function Backdrop(props: BackdropProps) {
    const {
        width,
        height,
        onMouseDown
    } = props;

    const theme = useContext<Theme>(ThemeContext).canvas.node.panel;

    return (
        <rect
            height={height}
            width={width}
            onMouseDown={onMouseDown}
            className={theme}
        />
    );
}

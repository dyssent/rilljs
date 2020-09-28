import React, { useContext, useMemo } from 'react';

import { IOValue, Coords, Rect, Port } from '../../../model';
import { PortZone } from '../PortZone';
import { TextBox, TextAlignment, TextVerticalAlignment, TextOverflow } from '../../TextBox';
import { Theme, ThemeContext } from '../../theme';

export interface ValuePortProps {
    pos: Coords;
    textRect: Rect;
    textAlignment: TextAlignment;
    port: Port;
    value: IOValue;
    readonly?: boolean;
}

export function ValuePort(props: ValuePortProps) {
    const {
        pos,
        textRect,
        textAlignment,
        port,
        value,
        readonly
    } = props;

    const theme = useContext<Theme>(ThemeContext).canvas.node.ports;
    const halfHeight = textRect.height / 2;

    return (
        <g
            className={theme.base}
        >
            <PortZone
                x={pos.x}
                y={pos.y + halfHeight}
                port={port}
                className={theme.value.class}
                readonly={readonly}
            />
            <TextBox
                pos={textRect}
                text={value.config.name || value.id}
                width={textRect.width}
                height={textRect.height}
                verticalAlignment={TextVerticalAlignment.Middle}
                alignment={textAlignment}
                overflow={TextOverflow.Ellipsis}
                className={theme.text}
            />
        </g>
    );
}

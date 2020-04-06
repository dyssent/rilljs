import React, { useContext, useMemo } from 'react';

import { IOValue, Coords, Port } from '../../../model';
import { PortZone } from '../PortZone';
import { TextBox, TextVerticalAlignment, TextOverflow } from '../../TextBox';
import { Theme, ThemeContext } from '../../theme';

export interface ValuePortProps {
    pos: Coords;
    width: number;
    port: Port;
    value: IOValue;
    readonly?: boolean;
}

export function ValuePort(props: ValuePortProps) {
    const {
        pos,
        port,
        width,
        value,
        readonly
    } = props;

    const theme = useContext<Theme>(ThemeContext).canvas.node.ports;
    const halfHeight = theme.value.height / 2;
    const halfWidth = theme.value.width / 2;

    const textBoxPos = useMemo(() => {
        return {
            x: pos.x + halfWidth + 5,
            y: pos.y
        };
    }, [pos, halfWidth]);

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
                pos={textBoxPos}
                text={value.config.name || value.id}
                width={width - halfWidth}
                height={theme.value.height}
                verticalAlignment={TextVerticalAlignment.Middle}
                overflow={TextOverflow.Ellipsis}
                className={theme.text}
            />
        </g>
    );
}

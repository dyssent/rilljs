import React, { useContext } from 'react';

import { Theme, ThemeContext } from '../../theme';
import { IOFlow, Rect, Coords, Port } from '../../../model';
import { PortZone } from '../PortZone';
import { TextBox, TextAlignment, TextVerticalAlignment, TextOverflow } from '../../TextBox';

export interface FlowPortProps {
    pos: Coords;
    textRect: Rect;
    textAlignment: TextAlignment;
    port: Port;
    flow: IOFlow;
    readonly?: boolean;
}

export const FlowPort = React.memo((props: FlowPortProps) => {
    const {
        pos,
        textRect,
        textAlignment,
        flow,
        port,
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
                readonly={readonly}
                className={theme.flow.class}
            />
            {
                flow.name &&
                <TextBox
                    pos={textRect}
                    text={flow.name}
                    width={textRect.width}
                    height={textRect.height}
                    verticalAlignment={TextVerticalAlignment.Middle}
                    alignment={textAlignment}
                    overflow={TextOverflow.Ellipsis}
                    className={theme.text}
                />
            }
        </g>
    );
});

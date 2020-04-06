import React, { useContext, useMemo } from 'react';

import { Theme, ThemeContext } from '../../theme';
import { IOFlow, Coords, Port } from '../../../model';
import { PortZone } from '../PortZone';
import { TextBox, TextVerticalAlignment, TextOverflow } from '../../TextBox';

export interface FlowPortProps {
    pos: Coords;
    width: number;
    port: Port;
    flow: IOFlow;
    readonly?: boolean;
}

export const FlowPort = React.memo((props: FlowPortProps) => {
    const {
        pos,
        width,
        flow,
        port,
        readonly
    } = props;

    const theme = useContext<Theme>(ThemeContext).canvas.node.ports;
    const halfHeight = theme.flow.height / 2;
    const halfWidth = theme.flow.width / 2;

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
                readonly={readonly}
                className={theme.flow.class}
            />
            {
                flow.name &&
                <TextBox
                    pos={textBoxPos}
                    text={flow.name}
                    width={width - halfWidth}
                    height={theme.flow.height}
                    verticalAlignment={TextVerticalAlignment.Middle}
                    overflow={TextOverflow.Ellipsis}
                    className={theme.text}
                />
            }
        </g>
    );
});

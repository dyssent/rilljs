import React, { useContext, useMemo } from 'react';

import { Theme, ThemeContext } from '../../theme';
import { IOFlow, Rect, Coords, Port } from '../../../model';
import { PortZone } from '../PortZone';
import { TextBox, TextAlignment, TextVerticalAlignment, TextOverflow } from '../../TextBox';
import { IconsNames } from '../../Icons';

export interface FlowPortProps {
    pos: Coords;
    textRect: Rect;
    textAlignment: TextAlignment;
    port: Port;
    flow: IOFlow;
    readonly?: boolean;
}

const IconSize = 20;
const IconPadding = 5;

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

    const [textBox, iconPos] = useMemo(() => {
        switch (textAlignment) {
            case TextAlignment.Middle:
            case TextAlignment.Left:
                return [{
                    x: textRect.x + IconSize + IconPadding,
                    y: textRect.y,
                    width: textRect.width - IconSize - IconPadding,
                    height: textRect.height
                }, {
                    x: textRect.x,
                    y: textRect.y + (textRect.height - IconSize) / 2 
                }];

            case TextAlignment.Right:
                return [{
                    x: textRect.x,
                    y: textRect.y,
                    width: textRect.width - IconSize - IconPadding,
                    height: textRect.height
                }, {
                    x: textRect.x + textRect.width - IconSize,
                    y: textRect.y + (textRect.height - IconSize) / 2 
                }];
        }
    }, [textAlignment, textRect]);

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
                    pos={textBox}
                    text={flow.name}
                    width={textBox.width}
                    height={textBox.height}
                    verticalAlignment={TextVerticalAlignment.Middle}
                    alignment={textAlignment}
                    overflow={TextOverflow.Ellipsis}
                    className={theme.text}
                />
            }
            <use xlinkHref={`#` + IconsNames.Arrow} transform={`translate(${iconPos.x},${iconPos.y})`} />
        </g>
    );
});

import React, {
    useMemo,
    useContext
} from 'react';

import { Connection, ConnectionDesign, ConnectionType, Coords } from '../../model';
import { ModelNodeState } from '../model';
import { calcNodeAndPortsLayout } from '../Node';
import { Theme, ThemeContext } from '../theme';
import { Line } from './Line';
import { mergeClasses } from '../Components';

export interface ConnectionProps {
    connection: Connection;
    design: ConnectionDesign;
    from: ModelNodeState;
    to: ModelNodeState;
    fromCoordsOverride?: Coords;
    toCoordsOverride?: Coords;
    disabled?: boolean;
    selected?: boolean;
    invalid?: string;
}

function ConnectionLineImpl(props: ConnectionProps) {
    const {
        connection,
        from: fromNodeState,
        to: toNodeState,
        disabled,
        fromCoordsOverride,
        toCoordsOverride,
        invalid
    } = props;

    const theme = useContext<Theme>(ThemeContext);
    const connectionTheme = theme.canvas.connection;
    const themeClasses = theme.classes;
    
    const active = false;
    // const [playAnim, setPlayAnim] = useState(false);
    const classes = useMemo(() => {
        return mergeClasses(
            connectionTheme.base,
            {
                [themeClasses.disabled]: disabled,
                [themeClasses.active]: active,
                [themeClasses.error]: invalid
            }
        );
    }, [
        connectionTheme.base,
        themeClasses,
        disabled,
        active,
        invalid
    ]);

    const { from, to } = useMemo(() => {
        const fromMap = calcNodeAndPortsLayout(fromNodeState.node, fromNodeState.design, theme.canvas, true);
        const toMap = calcNodeAndPortsLayout(toNodeState.node, toNodeState.design, theme.canvas, true);
        let fromCoords: Coords | undefined;
        let toCoords: Coords | undefined;

        switch (connection.type) {
            case ConnectionType.Flow:
                fromCoords = fromMap.flowsOut[connection.source.port].port;
                toCoords = toMap.flowsIn[connection.destination.port].port;
                break;

            case ConnectionType.Value:
                fromCoords = fromMap.valuesOut[connection.source.port].port;
                toCoords = toMap.valuesIn[connection.destination.port].port;
                break;                
        }

        if (!fromCoords || !toCoords) {
            throw new Error(`Invalid from / to nodes port in connection ${connection.id}. From: ${JSON.stringify(connection.source)}, To: ${JSON.stringify(connection.destination)}`);
        }

        return {
            from: {
                x: fromCoords.x + fromNodeState.design.x,
                y: fromCoords.y + fromNodeState.design.y,
            },
            to: {
                x: toCoords.x + toNodeState.design.x,
                y: toCoords.y + toNodeState.design.y,
            }
        };
    }, [connection, fromNodeState, toNodeState, theme]);

    // function onClick() {
    //     setPlayAnim(true);
    // }

    // function onAnimationStart() {
    //     setPlayAnim(false);
    // }

    // function onAnimationEnd() {
    //     setPlayAnim(false);
    // }

    return (
        <Line
            from={fromCoordsOverride || from}
            to={toCoordsOverride || to}
            type={connection.type}
            vector={!toCoordsOverride && !fromCoordsOverride ? true : false}
            className={classes}

            // className={playAnim ? 'rill-connection-run-anim' : undefined}
            // onClick={onClick}
            // onAnimationEnd={onAnimationEnd}
            // onAnimationStart={onAnimationStart}
        />
    );
}

export const ConnectionLine = React.memo(ConnectionLineImpl);

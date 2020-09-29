import React, { useContext, useState, useMemo, useCallback } from 'react';

import { Port } from '../../../model';
import { ModelActions, ModelActionsContext } from '../../model';
import { BaseProps, mergeClasses } from '../../Components';
import { Theme, ThemeContext } from '../../theme';

export interface PortZoneProps extends BaseProps {
    x: number;
    y: number;
    port: Port;

    readonly?: boolean;
}

export const PortZone = React.memo((props: PortZoneProps) => {
    const {
        x,
        y,
        port,
        className,
        style,
        readonly
    } = props;

    const actions = useContext<ModelActions>(ModelActionsContext);
    const theme = useContext<Theme>(ThemeContext);
    const [active, setActive] = useState(false);
    const [droppable, setDroppable] = useState(false);

    const classes = useMemo(() => {
        return mergeClasses(
            className,
            {
                [theme.classes.active]: active,
                [theme.classes.target]: droppable
            }
        );
    }, [className, theme, droppable, active]);

    const onMouseEnter = useCallback((event: React.MouseEvent<Element>) => {
        if (readonly) {
            return;
        }

        const ongoingConnection = actions.getOngoingConnection();
        if (ongoingConnection) {
            if (actions.isValidConnection(ongoingConnection.port, port)) {
                setDroppable(true);
                const mousePos = actions.adjustPageCoords({
                    x: event.clientX,
                    y: event.clientY
                });
                actions.updateConnectionEditTarget(port, mousePos);
            }
            setActive(false);
        } else {
            setActive(true);
        }
    }, [readonly, actions, port]);

    const onMouseLeave = useCallback((event: React.MouseEvent<Element>) => {
        if (readonly) {
            return;
        }

        setActive(false);
        if (droppable) {
            const mousePos = actions.adjustPageCoords({
                x: event.clientX,
                y: event.clientY
            });
            actions.updateConnectionEditTarget(undefined, mousePos);
        }
        setDroppable(false);
    }, [readonly, actions, droppable]);

    const onMouseDown = useCallback((event: React.MouseEvent<Element>) => {
        if (readonly) {
            return;
        }

        const mousePos = actions.adjustPageCoords({
            x: event.clientX,
            y: event.clientY
        });
        actions.beginConnectionEdit(port, mousePos);
    }, [readonly, actions, port]);

    const onMouseUp = useCallback((event: React.MouseEvent<Element>) => {
        if (readonly) {
            return;
        }
    }, [readonly]);

    return (
        <circle
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={classes}
            cx={x}
            cy={y}
            style={style}
        />
    );
}, (prev, next) =>
    prev.x === next.x &&
    prev.y === next.y &&
    prev.port.node === next.port.node &&
    prev.port.port === next.port.port &&
    prev.readonly === next.readonly
);

// <polygon points="205,31 218,38 205,45" class="rill-canvas-node-port-flow"></polygon>
import React, { useContext, useState, useMemo } from 'react';

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
    }, [readonly, droppable, active]);

    function onMouseEnter(event: React.MouseEvent<Element>) {
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
    }

    function onMouseLeave(event: React.MouseEvent<Element>) {
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
    }

    function onMouseDown(event: React.MouseEvent<Element>) {
        if (readonly) {
            return;
        }

        const mousePos = actions.adjustPageCoords({
            x: event.clientX,
            y: event.clientY
        });
        actions.beginConnectionEdit(port, mousePos);
    }

    function onMouseUp(event: React.MouseEvent<Element>) {
        if (readonly) {
            return;
        }
    }

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

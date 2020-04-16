import React, { useContext, useState, useEffect } from 'react';

import {
    TextBox,
    TextAlignment,
    TextVerticalAlignment,
    TextOverflow
} from '../../TextBox';
import { Theme, ThemeContext } from '../../theme';
import { ModelActions, ModelActionsContext } from '../../model';
import { Node, NodeDesign, Coords } from '../../../model';
import { Options, OptionsContext } from '../../options';
import { BaseProps } from '../../Components';

export interface NodeHeaderProps extends BaseProps {
    node: Node;
    width: number;
    design: NodeDesign;
    draggable?: boolean;
}

const Unnamed = '(Unnamed)';

export function Header(props: NodeHeaderProps) {
    const {
        node,
        width,
        design,
        className,
        style,
        draggable
    } = props;

    const options = useContext<Options>(OptionsContext);
    const actions = useContext<ModelActions>(ModelActionsContext);
    const theme = useContext<Theme>(ThemeContext);
    const headerTheme = theme.canvas.node.header;
    const [mouseDownPos, setMouseDownPos] = useState<Coords | undefined>();
    const [, setMousePos] = useState<Coords | undefined>();
    const [dragStartNodes, setDragStartNodes] = useState<Array<{id: string, pos: Coords}>>([]);

    const title = node.nodeName || node.defn.name || Unnamed;
    const color = design.color || (node.designDefn && node.designDefn.color);

    useEffect(() => {
        if (!mouseDownPos) {
            return;
        }
        const startPos = mouseDownPos;

        function adjustCoords(coords: Coords, forceSnap: boolean) {
            if (options.design.snapToGrid || forceSnap) {
                const gridStep = theme.canvas.grid.step;
                coords.x = Math.round(coords.x /  gridStep) * gridStep;
                coords.y = Math.round(coords.y / gridStep) * gridStep;
            }
            return coords;
        }

        function updateNodes(mouse: Coords, forceSnap: boolean) {
            const offset = actions.adjustForScale({
                x: mouse.x - startPos.x,
                y: mouse.y - startPos.y
            });

            const updatedCoords = dragStartNodes.map(n => ({
                id: n.id,
                pos: adjustCoords({
                    x: n.pos.x + offset.x,
                    y: n.pos.y + offset.y
                }, forceSnap)
            }));
            actions.moveNodes(updatedCoords);            
        }

        function onMouseMove(event: MouseEvent) {
            event.stopPropagation();
            event.preventDefault();

            const mouse = {
                x: event.clientX,
                y: event.clientY
            };
            updateNodes(mouse, event.shiftKey);
            setMousePos(mouse);
        }

        function onMouseUp(event: MouseEvent) {
            event.stopPropagation();
            event.preventDefault();

            const mouse = {
                x: event.clientX,
                y: event.clientY
            };

            updateNodes(mouse, event.shiftKey);
            setDragStartNodes([]);
            setMouseDownPos(undefined);
            setMousePos(undefined);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [
        mouseDownPos,
        dragStartNodes,
        actions,
        options,
        theme
    ]);

    function onMouseDown(event: React.MouseEvent<Element>) {
        if (!draggable) {
            return;
        }

        const isShiftPressed = event.shiftKey;

        const currentState = actions.findNode(node.nodeID);
        const alreadySelected = currentState && currentState.selected;
        const dragAll = alreadySelected;
        if (!alreadySelected) {
            actions.selectNodes(node.nodeID, !isShiftPressed, false);
        }
        actions.highlightNode(undefined);    

        const dragStartNodesList = actions
            .findNodes(n =>
                (dragAll && n.selected) || n.node.nodeID === node.nodeID
            )
            .map(n => ({
                id: n.node.nodeID,
                pos: {
                    x: n.design.x,
                    y: n.design.y
            }}));

        setDragStartNodes(dragStartNodesList);
        const pos = {
            x: event.clientX,
            y: event.clientY
        };
        setMouseDownPos(pos);
        setMousePos(pos);

        event.stopPropagation();
        event.preventDefault();
    }

    return (
        <g
            onMouseDown={onMouseDown}
            className={className}
            style={style}
        >
            <rect
                x={1}
                y={1}
                width={width - 2}
                height={theme.canvas.node.header.height - 1}
                className={headerTheme.base}
                style={
                    color ? {
                        fill: color
                    } : undefined
                }
            />
            <rect
                style={draggable ? {cursor: mouseDownPos ? 'grabbing' : 'grab'} : undefined}
                className={headerTheme.overlay}
                x={1}
                y={1}
                width={width - 2}
                height={theme.canvas.node.header.height - 1}
                cursor='drag'
            />
            <TextBox
                pos={{x: 0, y: 0}}
                text={title}
                width={width}
                height={theme.canvas.node.header.height + 2}
                alignment={TextAlignment.Middle}
                verticalAlignment={TextVerticalAlignment.Middle}
                overflow={TextOverflow.Ellipsis}
                className={headerTheme.text}
            />
        </g>
    );
}

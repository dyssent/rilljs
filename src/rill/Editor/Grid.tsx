import React, {
    useContext,
    useState,
    useEffect,
    useMemo,
    useRef
} from 'react';

import { Coords, rectFromPoints, Rect, Dimensions } from '../model';
import { ModelActionsContext, ModelActions } from './model';
import { Lasso } from './Lasso';
import { Theme, ThemeContext } from './theme';

export interface GridProps {
    coords: Coords;
    viewport: Dimensions;
    scale: number;
    disabled?: boolean;
}

enum GridState {
    None,
    Lasso,
    Pan
}

export const Grid = React.memo((props: React.PropsWithChildren<GridProps>) => {
    const {
        scale,
        coords,
        disabled,
        viewport
    } = props;

    const actions = useContext<ModelActions>(ModelActionsContext);
    const theme = useContext<Theme>(ThemeContext).canvas;
    const ref = useRef<SVGRectElement>(null);
    const [lassoRect, setLassoRect] = useState<Rect>();
    const [panStartOffset, setPanStartOffset] = useState<Coords>();
    const [mouseDownPos, setMouseDownPos] = useState<Coords>();
    const [state, setState] = useState<GridState>(GridState.None);

    function onMouseDown(event: React.MouseEvent<Element>) {
        const leftClick = event.nativeEvent.which === 1;
        const rightClick = event.nativeEvent.which === 3;

        if (!leftClick || disabled) {
            return;
        }

        const optionKeyPressed = event.altKey;

        // event.preventDefault();
        // event.stopPropagation();

        let pos = {
            x: event.clientX,
            y: event.clientY
        };
        if (rightClick || optionKeyPressed) {
            pos.x = pos.x / scale;
            pos.y = pos.y / scale;
            setState(GridState.Pan);
            setPanStartOffset(coords);
        } else {
            pos = actions.adjustPageCoords(pos, true);
            setState(GridState.Lasso);
            setLassoRect(rectFromPoints(pos, pos, coords));
        }
        setMouseDownPos(pos);
    }

    useEffect(() => {
        if (!ref.current || disabled) {
            return;
        }
        const element = ref.current;

        function onWheel(event: WheelEvent) {
            const zoomStep = 0.01;
            if (!event.shiftKey) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
    
            const isNegative = (n: number) => {
                return ((n = +n) || 1 / n) < 0;
            };
    
            const direction = (isNegative(event.deltaX) &&  isNegative(event.deltaY) ) ? 'down' : 'up';
            const newScale = direction === 'up' ? scale + zoomStep : scale - zoomStep;
            actions.zoom(newScale, actions.adjustPageCoords({
                x: event.clientX,
                y: event.clientY
            }, true));
        }

        element.addEventListener('wheel', onWheel);
        return () => {
            element.removeEventListener('wheel', onWheel);
        };
    }, [scale, actions, disabled]);

    useEffect(() => {
        if (!mouseDownPos || disabled) {
            return;
        }
        const startPos = mouseDownPos;

        function updatePan(mouse: Coords) {
            if (!panStartOffset) {
                return;
            }

            const offset = {
                x: panStartOffset.x + mouse.x - startPos.x,
                y: panStartOffset.y + mouse.y - startPos.y
            };
            actions.pan(offset);
        }

        function updateLassoSelection(mouse: Coords) {
            const selectionRect = rectFromPoints(startPos, mouse, coords);
            const toSelect = actions.findNodesInRect(selectionRect);
            actions.selectNodes(toSelect.map(n => n.node.nodeID), true, true);
        }

        function onMouseMove(event: MouseEvent) {
            event.stopPropagation();
            event.preventDefault();

            let mouse = {
                x: event.clientX,
                y: event.clientY
            };

            switch (state) {
                case GridState.Lasso:
                    mouse = actions.adjustPageCoords(mouse, true);
                    updateLassoSelection(mouse);
                    setLassoRect(rectFromPoints(startPos, mouse, coords));
                    break;
                case GridState.Pan:
                    mouse.x = mouse.x / scale;
                    mouse.y = mouse.y / scale;
                    updatePan(mouse);
                    break;
            }
        }

        function onMouseUp(event: MouseEvent) {
            if (!mouseDownPos) {
                return;
            }

            event.stopPropagation();
            event.preventDefault();

            let mouse = {
                x: event.clientX,
                y: event.clientY
            };

            switch (state) {
                case GridState.Lasso:
                    mouse = actions.adjustPageCoords(mouse, true);
                    updateLassoSelection(mouse);
                    setLassoRect(undefined);
                    break;

                case GridState.Pan:
                    mouse.x = mouse.x / scale;
                    mouse.y = mouse.y / scale;
                    updatePan(mouse);
                    setPanStartOffset(undefined);
                    break;
            }
            setMouseDownPos(undefined);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [
        panStartOffset,
        mouseDownPos,
        actions,
        disabled,
        scale,
        state,
        coords
    ]);

    const gridDims = useMemo<Dimensions>(() => {
        return {
            width: ((Math.ceil((viewport.width / scale / theme.grid.step)) + 1) * theme.grid.step),
            height: ((Math.ceil((viewport.height / scale / theme.grid.step)) + 1) * theme.grid.step)
        };
    }, [scale, viewport.width, viewport.height, theme.grid.step]);

    const gridOffset: Coords = {
        x: -Math.ceil(coords.x / theme.grid.step) * theme.grid.step,
        y: -Math.ceil(coords.y / theme.grid.step) * theme.grid.step
    };

    return (
        <g
            transform={`scale(${scale}, ${scale}),translate(${coords.x},${coords.y})`}
        >
            <rect
                x={gridOffset.x}
                y={gridOffset.y}
                width={gridDims.width}
                height={gridDims.height}
                fill="url(#grid)"
                onMouseDown={onMouseDown}
                ref={ref}
            />
            {
                props.children
            }
            {
                lassoRect &&
                <Lasso
                    rect={lassoRect}
                />
            }
        </g>  
    );
});


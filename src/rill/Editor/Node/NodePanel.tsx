import React, { useMemo, useContext } from 'react';

import { Header } from './Header';
import { Backdrop } from './Backdrop';
import { Content } from './Content';
import { FlowPort } from './FlowPort';
import { Node, NodeDesign, Coords, Rect, DesignViewMode } from '../../model';
import { Theme, ThemeContext, CanvasTheme } from '../theme';
import { ValuePort } from './ValuePort';
import { ModelActions, ModelActionsContext } from '../model';
import { TextBox, TextAlignment, TextOverflow } from '../TextBox';
import { ViewPrefsContext, ViewPrefs } from '../prefs';
import { mergeClasses, BaseProps, Icons } from '../Components';

export interface NodePanelProps extends BaseProps {
    node: Node;
    design: NodeDesign;
    selected?: boolean;
    invalid?: string;
    readonly?: boolean;
}

export interface NodeLayoutPort {
    port: Coords;
    icon?: Rect;
    text: Rect;
}

export interface NodeLayout {
    flowsIn: {[key: string]: NodeLayoutPort};
    flowsOut: {[key: string]: NodeLayoutPort};
    valuesIn: {[key: string]: NodeLayoutPort};
    valuesOut: {[key: string]: NodeLayoutPort};
    height: number;
    classCaption: Coords;
}

export function calcNodeAndPortsLayout(node: Node, design: NodeDesign, theme: CanvasTheme, portsCentered: boolean): NodeLayout {
    const flowsIn = node.getFlowInputs();
    const flowsOut = node.getFlowOutputs();
    const flowLines = Math.max(flowsIn.length, flowsOut.length);
    const valuesIn = node.getValueInputs();
    const valuesOut = node.getValueOutputs();
    const valuesLines = Math.max(valuesIn.length, valuesOut.length);

    const res: NodeLayout = {
        flowsIn: {},
        flowsOut: {},
        valuesIn: {},
        valuesOut: {},
        height:
            theme.node.header.height +
            flowLines * theme.node.ports.flow.height +
            valuesLines * theme.node.ports.value.height,
        classCaption: {
            x: 0,
            y: -15
        }
    };

    const flowOffset = theme.node.ports.flow.width + theme.node.ports.flow.width * 2 / 3;
    const flowCentered = portsCentered ? theme.node.ports.flow.height / 2 : 0;
    const valueOffset = theme.node.ports.value.width + theme.node.ports.value.width * 2 / 3;
    const valueCentered = portsCentered ? theme.node.ports.value.height / 2 : 0;
    const portOffset = Math.max(flowOffset, valueOffset);

    const padding = 7;

    flowsIn.forEach((f, fi) => {
        const fullWidth = fi >= flowsOut.length;
        res.flowsIn[f.id] = {
            port: {
                x: -portOffset,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered
            },
            text: {
                x: padding,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered,
                width: fullWidth ? design.width - padding * 2 : design.width / 2 - padding,
                height: theme.node.ports.flow.height
            }
        };
    });

    flowsOut.forEach((f, fi) => {
        const fullWidth = fi >= flowsIn.length;
        res.flowsOut[f.id] = {
            port: {
                x: design.width + portOffset,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered
            },
            text: {
                x: fullWidth ? padding : design.width / 2,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered,
                width: fullWidth ? design.width - padding * 2 : design.width / 2 - padding,
                height: theme.node.ports.flow.height
            }
        };
    });

    valuesIn.forEach((v, vi) => {
        const fullWidth = vi >= valuesOut.length;
        res.valuesIn[v.id] = {
            port: {
                x: -portOffset,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered
            },
            text: {
                x: padding,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered,
                width: fullWidth ? design.width - padding * 2 : design.width / 2 - padding,
                height: theme.node.ports.value.height
            }
        };
    });

    valuesOut.forEach((v, vi) => {
        const fullWidth = vi >= valuesIn.length;
        res.valuesOut[v.id] = {
            port: {
                x: design.width + portOffset,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered
            },
            text: {
                x: fullWidth ? padding : design.width / 2,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered,
                width: fullWidth ? design.width - padding * 2 : design.width / 2 - padding,
                height: theme.node.ports.value.height
            }
        };
    });

    return res;
}

const NodePanelImpl = (props: NodePanelProps) => {
    const {
        node,
        design,
        selected,
        readonly,
        invalid,
        className
    } = props;

    const actions = useContext<ModelActions>(ModelActionsContext);
    const prefs = useContext<ViewPrefs>(ViewPrefsContext);
    const theme = useContext<Theme>(ThemeContext);
    const themeClasses = theme.classes;
    const themeCanvas = theme.canvas;
    
    const classes = useMemo(() => {
        return mergeClasses(
            {
                [themeClasses.selected]: selected,
                [themeClasses.error]: invalid ? true : false
            },
            className
        );
    }, [themeClasses, selected, invalid, className]);

    const layoutMap = useMemo(() => {
        return calcNodeAndPortsLayout(node, design, themeCanvas, false);
    }, [node, themeCanvas, design]);

    function onMouseDown(event: React.MouseEvent<Element>) {
        const isShiftPressed = event.shiftKey;
        actions.selectNodes(node.nodeID, !isShiftPressed, isShiftPressed);

        event.preventDefault();
        event.stopPropagation();
    }

    function onMouseEnter() {
        if (actions.getSelectedNodes().length === 0) {
            actions.highlightNode(node.nodeID);
        }
    }

    function onMouseLeave() {
        actions.highlightNode(undefined);
    }

    const translate = `translate(${design.x},${design.y})`;

    const iconOffset = themeCanvas.node.error.offset;
    const flowsIn = node.getFlowInputs();
    const flowsOut = node.getFlowOutputs();
    const flowLines = Math.max(flowsIn.length, flowsOut.length);
    const valuesIn = node.getValueInputs();
    const valuesOut = node.getValueOutputs();
    const valuesLines = Math.max(valuesIn.length, valuesOut.length);
    const height = Math.max(design.height || layoutMap.height, themeCanvas.node.minHeight);

    return (
        <g transform={translate}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={classes}
        >
            {
                node.nodeName &&
                <TextBox
                    text={node.defn.class + (prefs.debug ? `id: ${node.nodeID}` : '')}
                    width={design.width}
                    height={5}
                    overflow={TextOverflow.Overflow}
                    pos={{
                        x: layoutMap.classCaption.x,
                        y: layoutMap.classCaption.y
                    }}
                    className={theme.classes.textDebug}
                />
            }
            <Backdrop
                width={design.width}
                height={height}
                onMouseDown={onMouseDown}
            />
            <Header
                node={node}
                draggable={!readonly}
                width={design.width}
                design={design}
            />
            <Content
                width={design.width}
                height={height}
            >
                {
                    flowLines > 0 &&
                    <>
                        {
                            flowsIn.map(f =>
                                <FlowPort
                                    key={f.id}
                                    flow={f}
                                    pos={layoutMap.flowsIn[f.id].port}
                                    textRect={layoutMap.flowsIn[f.id].text}
                                    textAlignment={TextAlignment.Left}
                                    port={{
                                        node: node.nodeID,
                                        port: f.id
                                    }}                  
                                    readonly={readonly}
                                    // onMouseDown={onPortMouseDown}
                                />
                            )
                        }
                        {
                            flowsOut.map(f =>
                                <FlowPort
                                    key={f.id}
                                    flow={f}
                                    pos={layoutMap.flowsOut[f.id].port}
                                    textRect={layoutMap.flowsOut[f.id].text}
                                    textAlignment={TextAlignment.Right}
                                    port={{
                                        node: node.nodeID,
                                        port: f.id
                                    }} 
                                    readonly={readonly}
                                    // onMouseDown={onPortMouseDown}
                                />
                            )
                        }
                    </>
                }
                {
                    valuesLines > 0 &&
                    <>
                        {
                            valuesIn.map(v =>
                                <ValuePort
                                    key={v.id}
                                    value={v}
                                    port={{
                                        node: node.nodeID,
                                        port: v.id
                                    }}
                                    pos={layoutMap.valuesIn[v.id].port}
                                    textRect={layoutMap.valuesIn[v.id].text}
                                    textAlignment={TextAlignment.Left}
                                    // onMouseDown={onPortMouseDown}
                                />
                            )
                        }
                        {
                            valuesOut.map(v =>
                                <ValuePort
                                    key={v.id}
                                    value={v}
                                    port={{
                                        node: node.nodeID,
                                        port: v.id
                                    }}                                    
                                    pos={layoutMap.valuesOut[v.id].port}
                                    textRect={layoutMap.valuesOut[v.id].text}
                                    textAlignment={TextAlignment.Right}
                                    // onMouseDown={onPortMouseDown}
                                />
                            )
                        }
                    </>
                }
            </Content>
            {
                invalid &&
                <g
                    transform={`translate(${design.width + iconOffset}, ${-iconOffset})`}
                    className={themeCanvas.node.error.class}
                >
                    {
                        Icons[themeCanvas.node.error.icon].map((d, i) => <path key={i} d={d} fillRule="evenodd" />)
                    }
                </g>
            }
            {
                prefs.mode === DesignViewMode.Detailed &&
                node.defn.description &&
                <TextBox
                    text={node.defn.description}
                    width={design.width}
                    height={design.height}
                    overflow={TextOverflow.Wrap}
                    pos={{
                        x: 0,
                        y: layoutMap.height + 5
                    }}
                    className={themeCanvas.node.desc}
                />
            }
        </g>
    );
}

export const NodePanel = React.memo(NodePanelImpl);

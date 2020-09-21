import React, { useMemo, useContext } from 'react';

import { Header } from './Header';
import { Backdrop } from './Backdrop';
import { Content } from './Content';
import { FlowPort } from './FlowPort';
import { Node, NodeDesign, Coords, DesignViewMode } from '../../model';
import { Theme, ThemeContext, CanvasTheme } from '../theme';
import { ValuePort } from './ValuePort';
import { ModelActions, ModelActionsContext } from '../model';
import { TextBox, TextOverflow } from '../TextBox';
import { ViewPrefsContext, ViewPrefs } from '../prefs';
import { mergeClasses, BaseProps, Icons } from '../Components';

export interface NodePanelProps extends BaseProps {
    node: Node;
    design: NodeDesign;
    selected?: boolean;
    invalid?: string;
    readonly?: boolean;
}

export function calcNodeAndPortsLayout(node: Node, design: NodeDesign, theme: CanvasTheme, portsCentered: boolean) {
    const flowsIn = node.getFlowInputs();
    const flowsOut = node.getFlowOutputs();
    const flowLines = Math.max(flowsIn.length, flowsOut.length);
    const valuesIn = node.getValueInputs();
    const valuesOut = node.getValueOutputs();
    const valuesLines = Math.max(valuesIn.length, valuesOut.length);

    const res: {
        flowsIn: {[key: string]: { port: Coords, text: Coords }},
        flowsOut: {[key: string]: { port: Coords, text: Coords }},
        valuesIn: {[key: string]: { port: Coords, text: Coords }},
        valuesOut: {[key: string]: { port: Coords, text: Coords }},
        height: number
    } = {
        flowsIn: {},
        flowsOut: {},
        valuesIn: {},
        valuesOut: {},
        height:
            theme.node.header.height +
            flowLines * theme.node.ports.flow.height +
            valuesLines * theme.node.ports.value.height
    };

    const flowOffset = theme.node.ports.flow.width + theme.node.ports.flow.width * 2 / 3;
    const flowCentered = portsCentered ? theme.node.ports.flow.height / 2 : 0;
    const valueOffset = theme.node.ports.value.width + theme.node.ports.value.width * 2 / 3;
    const valueCentered = portsCentered ? theme.node.ports.value.height / 2 : 0;
    const portOffset = Math.max(flowOffset, valueOffset);

    flowsIn.forEach((f, fi) => {
        res.flowsIn[f.id] = {
            port: {
                x: -portOffset,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered    
            },
            text: {
                x: 0,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered    
            }
        };
    });

    flowsOut.forEach((f, fi) => {
        res.flowsOut[f.id] = {
            port: {
                x: design.width + portOffset,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered    
            },
            text: {
                x: design.width + portOffset,
                y: theme.node.header.height + fi * theme.node.ports.flow.height + flowCentered    
            }
        };
    });

    valuesIn.forEach((v, vi) => {
        res.valuesIn[v.id] = {
            port: {
                x: -portOffset,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered    
            },
            text: {
                x: 0,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered
            }
        };
    });

    valuesOut.forEach((v, vi) => {
        res.valuesOut[v.id] = {
            port: {
                x: design.width + portOffset,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered    
            },
            text: {
                x: design.width + portOffset,
                y: theme.node.header.height + vi * theme.node.ports.value.height + flowLines * theme.node.ports.flow.height + valueCentered    
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
    }, [theme, selected, invalid]);

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
                prefs.debug &&
                <TextBox
                    text={`id: ${node.nodeID}`}
                    width={design.width}
                    height={5}
                    overflow={TextOverflow.Overflow}
                    pos={{
                        x: 0,
                        y: -15
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
                                    textPos={layoutMap.flowsIn[f.id].text}
                                    port={{
                                        node: node.nodeID,
                                        port: f.id
                                    }}                  
                                    readonly={readonly}
                                    width={design.width}
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
                                    textPos={layoutMap.flowsOut[f.id].text}
                                    port={{
                                        node: node.nodeID,
                                        port: f.id
                                    }} 
                                    readonly={readonly}
                                    width={design.width}
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
                                    textPos={layoutMap.valuesIn[v.id].text}
                                    width={design.width}
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
                                    textPos={layoutMap.valuesOut[v.id].text}
                                    width={design.width}
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

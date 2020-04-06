import React, {
    useState,
    useEffect,
    useRef,
    RefForwardingComponent,
    forwardRef,
    useImperativeHandle,
    useMemo
}  from 'react';

import { NodePanel } from './Node';
import { Styles } from './Styles';
import {
    Graph,
    Design,
    Coords,
    ConnectionType,
    Node,
    distance,
    Rect
} from '../model';
import {
    Options,
    OptionsContext,
    DesignOptions,
    useOptions
} from './options';
import {
    ThemeContext,
    defaultTheme,
    Theme
} from './theme';
import {
    useModel,
    ModelViewContext,
    ModelActionsContext,
    ModelConnectionState,
    ModelNodeState,
    ModelActions
} from './model';
import { Grid } from './Grid';
import { ConnectionLine, Line } from './ConnectionLine';
import { RillEditorRef, EditorDialogsContext } from './ref';
import { useResizeObservable } from './hooks';
import { ViewPrefsContext, ViewPrefs, defaultViewPrefs } from './prefs';
import { NodeSelectDialog } from './NodeSelectDialog';
import { SnippetsDialog } from './SnippetsDialog';
import { EditOverlay } from './EditOverlay';
import { ControlsPanel } from './ControlsPanel';
import { BaseProps, mergeClasses } from './Components';
import { RillEditorHooks, RillEditorHooksContext } from './editorHooks';

export interface RillEditorProps extends BaseProps {
    graph: Graph;
    options?: Partial<Options & {design?: Partial<DesignOptions>}>;
    theme?: Theme;
    design?: Design;
    readonly?: boolean;
    prefs?: ViewPrefs;

    hooks?: Partial<RillEditorHooks>;
}

const RillEditorImpl: RefForwardingComponent<RillEditorRef, RillEditorProps> = (props, fref) => {
    const {
        graph,
        design,
        theme = defaultTheme,
        prefs = defaultViewPrefs,
        style,
        hooks: originalHooks,
        className
    } = props;

    const options = useOptions(props.options);

    const {
        readonly,
    } = options;

    const hooks = useMemo(() => {
        return originalHooks || {};
    }, [originalHooks]);

    const ref = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const dims = useResizeObservable(ref);

    const [mousePos, setMousePos] = useState<Coords>({x:0, y:0});
    const [snippetDialogOpen, setSnippetDialogOpen] = useState(false);
    // This set of states must be reset upon change of a graph
    const [modelView, modelActions] = useModel(graph, design, options, hooks, ref);
    const [createDialog, setCreateDialog] = useState<{
        onSelect: (nodeTypeID: string) => void,
        onCancel: () => void,
        predicate?: (node: Node) => boolean
    } | undefined>(undefined);
    // This is the end of the set that needs a reset

    function getEditorDialogs(actions: ModelActions, opts: Options, dimensions: Rect)  {
        function openCreateDialog(coords?: Coords) {
            const onCancel = () => {
                setCreateDialog(undefined);
            };

            const onSelect = (nodeClass: string) => {
                const node = opts.registry.create(nodeClass);
                if (!node) {
                    onCancel();
                    return;
                }

                const pan = actions.getPan();
                const pos = coords || {
                    x: -pan.x + dimensions.width / 2,
                    y: -pan.y + dimensions.height / 2
                };                
                actions.createNode(node, pos);
                setCreateDialog(undefined);
            };

            setCreateDialog({
                onSelect,
                onCancel
            });
        }

        function openSnippetDialog() {
            setSnippetDialogOpen(true);
        }

        return {
            openCreateDialog,
            openSnippetDialog
        };
    }

    const editorDialogs = useMemo(
        () => getEditorDialogs(modelActions, options, dims)
    , [modelActions, options, dims]);

    function closeSnippetDialog() {
        setSnippetDialogOpen(false);
    }

    function onDoubleClick(event: React.MouseEvent<HTMLElement>) {
        if (createDialog || snippetDialogOpen) {
            return;
        }

        editorDialogs.openCreateDialog(modelActions.adjustPageCoords({
            x: event.clientX,
            y: event.clientY
        }));
    }

    function onMouseUp(event: React.MouseEvent<Element>) {
        if (!modelView.editingConnection || createDialog) {
            return;
        }

        const editConn = modelView.editingConnection;
        if (distance(editConn.anchorPos, editConn.targetPos) < options.design.distanceThreshold) {
            modelActions.cancelConnectionEdit();
            return;
        }

        switch (editConn.type) {
            case ConnectionType.Value:
                if (editConn.targetPort) {
                    modelActions.finishConnectionEdit();
                } else {
                    modelActions.cancelConnectionEdit();
                }
                break;

            case ConnectionType.Flow:{
                if (editConn.targetPort) {
                    modelActions.finishConnectionEdit();
                    setCreateDialog(undefined);
                } else {
                    // If we got here, we most likely need to create a new node, let's
                    // finalize this process here

                    const needsOut = editConn.isAnchorOut ? false : true;

                    const onCancel = () => {
                        modelActions.cancelConnectionEdit();
                        setCreateDialog(undefined);
                    };
    
                    const onSelect = (nodeClass: string) => {
                        const node = options.registry.create(nodeClass);
                        if (!node) {
                            onCancel();
                            return;
                        }
    
                        modelActions.createNode(node, editConn.targetPos);
                        modelActions.updateConnectionEditTarget({
                            node: node.nodeID,
                            port: (!needsOut ? node.getFlowInputs() : node.getFlowOutputs())[0].id
                        }, {x: 0, y: 0});
                        modelActions.finishConnectionEdit();
                        setCreateDialog(undefined);
                    };
    
                    const predicate = (node: Node) => (needsOut ? node.getFlowOutputs() : node.getFlowInputs()).length > 0;
                    setCreateDialog({
                        onSelect,
                        onCancel,
                        predicate
                    });
                }
            } break;
        }
    }

    function onKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
        // It's important to use KeyUp, in KeyPress
        // Delete and Period returns the same code 46
        // TODO
        // if (isInFocus(editDialog or createDialog))
        // switch (event.which) {
        //     case Keys.Delete:
        //     case Keys.Backspace:
        //         modelActions.deleteNodes(modelActions.getSelectedNodes().map(n => n.node.nodeID));
        //         break;
        //     default:
        //         // Nothing here for now...
        // }
    }

    useEffect(() => {
        function onMouseMove(event: MouseEvent) {
            const mouse = modelActions.adjustPageCoords({
                x: event.clientX,
                y: event.clientY
            });
            setMousePos(mouse);
        }

        document.addEventListener("mousemove", onMouseMove);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
        };
    }, [modelActions]);

    useEffect(() => {
        if (!modelView.editingConnection || modelView.editingConnection.targetPort || createDialog) {
            return;
        }

        const targetPos = modelView.editingConnection.targetPos;
        if (targetPos.x === mousePos.x && targetPos.y === mousePos.y) {
            return;
        }

        modelActions.updateConnectionEditTarget(undefined, mousePos);
    }, [modelView.editingConnection, mousePos, modelView.pan, createDialog]);

    useEffect(() => {
        setCreateDialog(undefined);
    }, [modelActions]);

    useImperativeHandle(fref, () => {
        return {
            ref,
            actions: modelActions,
            dialogs: editorDialogs
        };
    });

    const editingConnection = modelView.editingConnection && modelView.editingConnection.reference ?
        modelView.connections[modelView.editingConnection.reference] : undefined;

    function renderNode(node: ModelNodeState | string, skipHighlight: boolean) {
        const n = typeof node === 'string' ? modelView.nodes[node] : node;
        if (!n) {
            return null;
        }
        if (skipHighlight && n.node.nodeID === modelView.nodeHighlight) {
            return null;
        }

        return (
            <NodePanel
                key={n.node.nodeID}
                node={n.node}
                design={n.design}
                readonly={readonly}
                selected={n.selected}
                invalid={n.invalid}
            />
        );
    }

    function renderConnection(c: ModelConnectionState, skipHighlight: boolean) {
        if (modelView.editingConnection &&
            modelView.editingConnection.reference === c.connection.id) {
            return null;
        }

        if (skipHighlight &&
            (modelView.nodeHighlight === c.connection.source.node ||
            modelView.nodeHighlight === c.connection.destination.node)) {
                return null;
        }

        const from = modelView.nodes[c.connection.source.node];
        const to = modelView.nodes[c.connection.destination.node];
        if (!from || !to) {
            console.warn(`Inconsistent state, connection ${JSON.stringify(c)} is not valid.`);
            return null;
        }

        return (
            <ConnectionLine
                key={c.connection.id}
                connection={c.connection}
                design={c.design}
                from={from}
                to={to}
                invalid={c.invalid}
                selected={c.selected}
            />
        );
    }

    function renderEditingConnection() {
        if (!modelView.editingConnection) {
            return null;
        }
    
        return (
            editingConnection ?
                <ConnectionLine
                    key={editingConnection.connection.id}
                    connection={editingConnection.connection}
                    design={editingConnection.design}
                    from={modelView.nodes[editingConnection.connection.source.node]}
                    to={modelView.nodes[editingConnection.connection.destination.node]}
                    fromCoordsOverride={
                        modelView.editingConnection.anchorPort.port === editingConnection.connection.destination.port ?
                        modelView.editingConnection.targetPos : undefined}
                    toCoordsOverride={
                        modelView.editingConnection.anchorPort.port === editingConnection.connection.source.port ?
                        modelView.editingConnection.targetPos : undefined}
                    disabled={true}
                />
            :
                <Line
                    className={`${theme.canvas.connection.base} ${theme.classes.disabled}`}
                    from={modelView.editingConnection.anchorPos}
                    to={modelView.editingConnection.targetPos}
                    type={modelView.editingConnection.type}
                    vector={false}
                />
        )
    }

    function renderHighlight() {
        if (!modelView.nodeHighlight) {
            return null;
        }

        const conns = Object.values(modelView.connections).filter(c => c.connection.source.node === modelView.nodeHighlight ||
            c.connection.destination.node === modelView.nodeHighlight);
        
        return [
            ...conns.map(c => renderConnection(c, false)),
            renderNode(modelView.nodeHighlight, false)
        ];
    }

    return (
        <OptionsContext.Provider value={options}>
        <RillEditorHooksContext.Provider value={hooks}>
        <ViewPrefsContext.Provider value={prefs}>
        <ThemeContext.Provider value={theme}>
        <ModelActionsContext.Provider value={modelActions}>
        <ModelViewContext.Provider value={modelView}>
        <EditorDialogsContext.Provider value={editorDialogs}>
            <div
                ref={ref}
                tabIndex={0}
                style={style}
                className={mergeClasses(theme.classes.theme, className)}
                onMouseUp={onMouseUp}
                onDoubleClick={onDoubleClick}
                onKeyUp={onKeyUp}
            >
                <ControlsPanel
                    controls={prefs.controls}
                    editorElement={ref.current}
                >
                    {prefs.controlsChildren}
                </ControlsPanel>
                <svg
                    className={theme.classes.svg}
                    ref={svgRef}
                >
                    <defs>
                        <Styles />
                    </defs>
                    <Grid
                        scale={modelView.scale}
                        coords={modelView.pan}
                        viewport={dims}
                        disabled={createDialog || snippetDialogOpen ? true : false}
                    >
                        {
                            Object.values(modelView.connections).map(c => renderConnection(c, true))
                        }
                        {
                            modelView.nodesOrder.map(nid => renderNode(nid, true))
                        }
                        {
                            renderHighlight()
                        }
                        {
                            renderEditingConnection()
                        }
                    </Grid>
                </svg>
                <NodeSelectDialog
                    isOpen={createDialog ? true : false}
                    title="Create Node"
                    usePortal={prefs.usePortal.createNode}
                    onSelect={createDialog ? createDialog.onSelect : undefined}
                    onClose={createDialog ? createDialog.onCancel : undefined}
                    predicate={createDialog ? createDialog.predicate : undefined}
                />
                <SnippetsDialog
                    isOpen={snippetDialogOpen}
                    usePortal={prefs.usePortal.snippet}
                    snippets={options.design.snippets}
                    onClose={closeSnippetDialog}
                />
                <EditOverlay
                    nodes={modelView.nodesSelected}
                    allowMultiNodeEdit={prefs.allowMultiNodeEdit}
                />
                {/* <EditorMenu
                    target={ref.current}
                /> */}
            </div>
        </EditorDialogsContext.Provider>            
        </ModelViewContext.Provider>
        </ModelActionsContext.Provider>
        </ThemeContext.Provider>
        </ViewPrefsContext.Provider>
        </RillEditorHooksContext.Provider>
        </OptionsContext.Provider>
    );
}

export const RillEditor = forwardRef(RillEditorImpl);

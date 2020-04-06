import React, { useContext, useMemo } from 'react';

import { Theme, ThemeContext } from '../theme';
import { ZoomIn } from './ZoomIn';
import { ResetZoom } from './ResetZoom';
import { ZoomOut } from './ZoomOut';
import { Divider, mergeClasses, Button } from '../Components';
import { FullScreen } from './Fullscreen';
import { CreateNew } from './CreateNew';
import { InsertSnippet } from './InsertSnippet';
import { ModelActions, ModelActionsContext, ModelConnectionState } from '../model';
import { copyModelSelectionJSON, pasteModelJSON } from '../utils';
import { Options, OptionsContext } from '../options';

export interface ControlsBuiltins {
    zoomIn?: boolean;
    zoomOut?: boolean;
    resetZoom?: boolean;
    fullscreen?: boolean;
    createNew?: boolean;
    insertSnippet?: boolean;
}

export interface ControlsPanelProps {
    controls?: ControlsBuiltins;
    editorElement?: HTMLElement | null;
}

export function copyToClipboard(text: string) {
    // const selection = document.getSelection();
    // const range = selection ? selection.getRangeAt(0) : undefined;
    navigator.clipboard.writeText(text);

    // const tempInput = document.createElement("input");
    // tempInput.type = "text";
    // tempInput.value = text;

    // document.body.appendChild(tempInput);
    // tempInput.select();
    // document.execCommand("Copy");
    // document.body.removeChild(tempInput);

    // if (range && selection) {
    //     selection.removeAllRanges();
    //     selection.addRange(range);
    // }
}

export async function pasteFromClipboard(): Promise<string> {
    const text = await navigator.clipboard.readText();
    return text;
}

export function ControlsPanel(props: React.PropsWithChildren<ControlsPanelProps>) {
    const {
        children,
        editorElement,
        controls = {}
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const actions = useContext<ModelActions>(ModelActionsContext);
    const registry = useContext<Options>(OptionsContext).registry;

    function stopPropagation(event: React.SyntheticEvent) {
        event.stopPropagation();
    }

    const buttons = useMemo(() => {
        async function onPaste() {
            // Paste from the buffer
            const text = await pasteFromClipboard();
            try {
                pasteModelJSON(JSON.parse(text), actions, registry);
            } catch (e) {
                console.warn(`Can't paste from clipboard: ${e}`, text, e);
            }
        }

        const items = [
            (controls.fullscreen && editorElement) ? <FullScreen key="full" editorElement={editorElement} /> : null
        ];
    
        if ((controls.zoomIn || controls.zoomOut || controls.resetZoom) && items.length > 0) {
            items.push(<Divider key="div1" />);
        }
        items.push(...[
            controls.resetZoom ? <ResetZoom key="resetzoom" /> : null,
            controls.zoomOut ? <ZoomOut key="zoomout" /> : null,
            controls.zoomIn ? <ZoomIn key="zoomin" /> : null
        ]);
    
        if ((controls.createNew || controls.insertSnippet) && items.length > 0) {
            items.push(<Divider key="div2" />);
        }
        items.push(...[
            controls.insertSnippet ? <InsertSnippet key="insertsnippet" /> : null,
            controls.createNew ? <CreateNew key="createnew" /> : null,
        ]);

        if ((controls.insertSnippet || controls.createNew) && items.length > 0) {
            items.push(<Divider key="div3" />);
        }
        items.push(
            <Button
                key="paste"
                icon="clipboard"
                title="Paste"
                onClick={onPaste}
            />
        );
    
        return items.filter(i => i ? true : false);
    }, [
        actions,
        controls.fullscreen,
        controls.zoomIn,
        controls.zoomOut,
        controls.resetZoom,
        controls.createNew,
        controls.insertSnippet,
        editorElement
    ]);

    function onDeleteSelected() {
        actions.deleteNodes(actions.getSelectedNodes().map(n => n.node.nodeID));
    }

    function onCopySelected() {
        const json = copyModelSelectionJSON(actions);
        copyToClipboard(JSON.stringify(json));
    }

    return (
        <div
            className={theme.controlsPanel}
        >
            <div
                className={mergeClasses(theme.panel, theme.controlsPanelBlock)}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onMouseUp={stopPropagation}
            >
                {
                    buttons
                }
                {
                    buttons.length > 0 && children &&
                    <Divider />
                }
                {
                    children
                }
            </div>
            {
                actions.getSelectedNodes().length > 0 &&
                <div
                    className={mergeClasses(theme.panel, theme.controlsPanelBlock)}
                    onMouseDown={stopPropagation}
                    onDoubleClick={stopPropagation}
                    onMouseUp={stopPropagation}
                >
                    <Button
                        icon="trash"
                        title="Delete selected"
                        onClick={onDeleteSelected}
                    />
                    <Button
                        icon="duplicate"
                        title="Copy selected"
                        onClick={onCopySelected}
                    />
                </div>
            }
        </div>
    );
};

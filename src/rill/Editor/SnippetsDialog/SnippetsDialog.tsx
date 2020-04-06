import React, { useContext, useState } from 'react';

import { Theme, ThemeContext } from '../theme';
import { DialogProps, Dialog, SelectItemRendererProps, Select, Switch } from '../Components';
import { Snippet } from './snippet';
import { ModelActions, ModelActionsContext } from '../model';
import { pasteModelJSON } from '../utils';
import { Registry } from '../../model';
import { Options, OptionsContext } from '../options';
import { RillEditorHooks, RillEditorHooksContext } from '../editorHooks';

export interface SnippetsDialogProps extends DialogProps {
    snippets?: Snippet[];
}

function applySnippet(snippet: Snippet, actions: ModelActions, registry: Registry, replaceAll: boolean) {
    if (replaceAll) {
        const allNodes = actions.findNodes(n => true).map(n => n.node.nodeID);
        const allConnections = actions.findConnections(c => true).map(c => c.connection.id);
        actions.deleteConnections(allConnections);
        actions.deleteNodes(allNodes);
    }
    pasteModelJSON(snippet.chunk, actions, registry);
}

export const SnippetsDialog = React.memo((props: SnippetsDialogProps) => {
    const {
        isOpen,
        onClose,
        usePortal,
        snippets = []
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const actions = useContext<ModelActions>(ModelActionsContext);
    const hooks = useContext<RillEditorHooks>(RillEditorHooksContext);
    const options = useContext<Options>(OptionsContext);
    const [replaceAll, setReplaceAll] = useState(false);

    function onSnippetSelect(snippet: Snippet) {
        if (!onClose) {
            return;
        }
        applySnippet(snippet, actions, options.registry, replaceAll);
        if (hooks.onSnippetApply) {
            hooks.onSnippetApply(snippet.id, replaceAll);
        }
        onClose();
    }

    function snippetRenderer(snippetProps: SelectItemRendererProps<Snippet>) {
        const snippet = snippetProps.item;
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={snippetProps.onClick}
            >
                <span>
                    {snippet.name}
                </span>
                <small className={theme.textMuted} >
                    {snippet.description}
                </small>
            </div>            
        );        
    }

    function snippetPredicate(snippet: Snippet, filter: string): boolean {
        const fl = filter.toLowerCase();
        const nl = (snippet.name + ' ' + snippet.description).toLowerCase();
        return nl.indexOf(fl) >= 0;
    }

    function toggleReplace() {
        setReplaceAll(!replaceAll);
    }
    
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            usePortal={usePortal}
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <h2 className={theme.heading}>Snippets Library</h2>
                    <Switch
                        checked={replaceAll}
                        onChange={toggleReplace}
                        label="Replace Content with Snippet"
                    />
                </div>
            }
        >
            <Select<Snippet>
                items={snippets}
                itemRenderer={snippetRenderer}
                itemPredicate={snippetPredicate}
                onSelect={onSnippetSelect}
            />
        </Dialog>
    );    
});

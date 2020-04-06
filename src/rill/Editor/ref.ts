import React from 'react';

import { ModelActions } from './model';
import { Coords } from '../model';

export interface EditorDialogs {
    openCreateDialog: (coords?: Coords) => void;
    openSnippetDialog: () => void;
}

// @ts-ignore
export const EditorDialogsContext = React.createContext<EditorDialogs>({});

export interface RillEditorRef {
    ref: React.RefObject<HTMLDivElement>;
    actions: ModelActions;
    dialogs: EditorDialogs;
}

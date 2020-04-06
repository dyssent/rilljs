import React from 'react';

import { DesignViewMode } from '../model';
import {
    ControlsBuiltins
} from './ControlsPanel';

export interface ViewPrefs {
    debug?: boolean;
    mode: DesignViewMode;
    controls?: ControlsBuiltins;
    controlsChildren?: React.ReactNode;
    usePortal: {
        createNode?: boolean;
        snippet?: boolean;
        contextMenu?: boolean;
    };
    allowMultiNodeEdit?: boolean;
}

export const defaultViewPrefs: ViewPrefs = {
    debug: false,
    mode: DesignViewMode.Normal,
    controls: {
        zoomIn: true,
        zoomOut: true,
        resetZoom: true,
        fullscreen: true,
        insertSnippet: true,
        createNew: true
    },
    usePortal: {
        createNode: false,
        snippet: false,
        contextMenu: true
    },
    allowMultiNodeEdit: false
};

export const ViewPrefsContext = React.createContext(defaultViewPrefs);

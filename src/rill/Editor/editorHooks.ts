import React from 'react';

import { ModelHooks } from './model';

export interface RillEditorHooks extends Partial<ModelHooks> {
    onSnippetApply?: (id: string, replaceAll?: boolean) => void;
}

export const RillEditorHooksContext = React.createContext<RillEditorHooks>({});

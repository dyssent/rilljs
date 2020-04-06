import {
    ConsoleLog
} from './console';
import {
    BrowserAlert,
    BrowserConfirm,
    BrowserPrompt
} from './browser';
import {
    Entry,
    Exit,
    Parallel,
    Wait
} from './flow';

export * from './console';
export * from './browser';
export * from './flow';

export const BuiltinNodeTypes = [
    ConsoleLog,

    BrowserAlert,
    BrowserConfirm,
    BrowserPrompt,

    Entry,
    Exit,
    Parallel,
    Wait
];

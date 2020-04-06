import { Intent } from './intent';
import { CSSProperties } from 'react';

export interface IntentProps {
    intent?: Intent;
}

export interface BaseProps {
    className?: string;
    style?: CSSProperties;
}

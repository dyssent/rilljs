import React, { CSSProperties } from 'react';

import { darkTheme } from './themes';
import { IconName } from './Components';

// export interface PathTheme {
//     fill?: string;
//     stroke?: string;
//     strokeWidth?: number;
//     strokeDasharray?: number;
//     opacity?: number;
//     filter?: string;
//     rx?: number;
//     ry?: number;
// }

// export interface TextTheme {
//     style?: CSSProperties;
//     fill?: string;
//     filter?: string;
//     className?: string;
// }

// export interface NodePortBackTheme extends PathTheme {
//     r: number;
//     height: number;
// }

// export interface NodePortTheme {
//     back: NodePortBackTheme;
//     text: TextTheme;
// }

export interface ShadowFilter {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    filterUnits?: string;
    dx: number;
    dy: number;
    stdDeviation: number;
    floodColor: string;
    floodOpacity: number;
}

export interface GradientFilter {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stops: Array<{offset: number, stopColor: string}>;
}

export interface FiltersTheme {
    shadows: {[key: string]: ShadowFilter};
    gradients: {[key: string]: GradientFilter};
}

export interface ThemeClasses {
    theme: string;
    svg: string;
    lowquality: string;
    portal: string;
    heading: string;
    overlay: {
        container: string;
        backdrop: string;
        content: string;
    };
    menu: {
        container: string;
        divider: string;
        item: string;
    };
    inputField: string;
    input: string;
    controlGroup: string;
    controls: {
        control: string;
        indicator: string;
        indicatorChild: string;
        switch: string;
        switchInnerText: string;
        checkbox: string;
    };
    label: string;
    help: string;
    intents: {
        primary: string;
        warning: string;
        danger: string;
        success: string;
    };
    panel: string;
    dialog: string;
    inline: string;
    fill: string;
    round: string;
    textMuted: string;
    textDebug: string;
    node: {
        container: string;
        header: string;
        content: string;
        error: string;
    };
    resizer: string;
    icon: string;
    button: string;
    buttonText: string;
    buttonGroup: string;
    controlsPanel: string;
    controlsPanelBlock: string;
    // States
    disabled: string;
    active: string;
    target: string;
    selected: string;
    error: string;
}

export interface CanvasTheme {
    connection: {
        base: string;
        flow: string;
        value: string;
    };
    node: {
        minHeight: number;
        header: {
            height: number;
            base: string;
            text: string;
            overlay: string;
        };
        panel: string;
        ports: {
            base: string;
            flow: {
                class: string;
                width: number;
                height: number;
            };
            value: {
                class: string;
                width: number;
                height: number;
            };
            text: string;
        };
        error: {
            class: string;
            icon: IconName;
            offset: number;
        };
        desc: string;
    };
    grid: {
        step: number;
        small: string;
        large: string;
    };
    lasso: string;
}

export interface Theme {
    name: string;
    classes: ThemeClasses;
    canvas: CanvasTheme;
    filters: FiltersTheme;
}

export const defaultTheme = darkTheme;
export const ThemeContext = React.createContext<Theme>(defaultTheme);

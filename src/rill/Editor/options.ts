import React, { useMemo } from 'react';

import {
    Registry,
    defaultRegistry,
    Rect,
    Coords
} from '../model';
import { Snippet } from './SnippetsDialog';
import {
    DataDrawerProps,
    NodeDrawerProps,
    defaultDataDrawers
} from './Drawers';

export enum PortConflictPolicy {
    Allow,
    Replace,
    Reject
}

export interface DesignOptions {
    snapToGrid: boolean;
    historyLength: number;
    boundingBox: Rect;
    distanceThreshold: number;
    defaultPan?: Coords;
    defaultScale?: number;
    minScale: number;
    maxScale: number;
    snippets: Snippet[];
    policy: {
        ports: {
            flowOut: PortConflictPolicy;
            valueIn: PortConflictPolicy;
        }
    }
}

export interface ValidationOptions {
    selfConnectedNodes: boolean;
}

export interface DrawersOptions {
    nodes: {[key: string]: React.FunctionComponent<NodeDrawerProps> | React.ClassicComponentClass<NodeDrawerProps>};
    data: {[key: string]: React.FunctionComponent<DataDrawerProps> | React.ClassicComponentClass<DataDrawerProps>};
}

export const defaultDrawers: DrawersOptions = {
    nodes: {},
    data: defaultDataDrawers
};

export const defaultValidationOptions: ValidationOptions = {
    selfConnectedNodes: false
}

export const defaultDesignOptions: DesignOptions = {
    snapToGrid: false,
    historyLength: 100,
    boundingBox: {
        x: -5000,
        y: -5000,
        width: 10000,
        height: 10000
    },
    distanceThreshold: 10,
    minScale: 0.2,
    maxScale: 1.5,
    snippets: [],
    policy: {
        ports: {
            flowOut: PortConflictPolicy.Replace,
            valueIn: PortConflictPolicy.Replace
        }
    }
};

export interface Options {
    registry: Registry;
    readonly: boolean;
    design: DesignOptions;
    validation: ValidationOptions;
    drawers: DrawersOptions;
    debug?: boolean;
}

export const defaultOptions: Options = {
    registry: defaultRegistry,
    readonly: true,
    design: defaultDesignOptions,
    validation: defaultValidationOptions,
    drawers: defaultDrawers
};

export const OptionsContext = React.createContext<Options>(defaultOptions);

export function useOptions(options?: Partial<Options & {design?: Partial<DesignOptions>}>) {
    return useMemo(() => {
        return {
            ...defaultOptions,
            ...(options || {}),
            design: {
                ...defaultDesignOptions,
                ...((options && options.design) || {})
            }
        };
    }, [options])
}

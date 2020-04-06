import { Theme } from '../theme';
import { defaultOptions } from '../options';

export const DarkThemeID = 'dark';
export const darkTheme: Theme = {
    name: 'dark',
    classes: {
        theme: 'rill rill-dark',
        svg: 'rill-svg',
        lowquality: '.rill-lowquality',
        portal: 'rill-portal',
        heading: 'rill-heading',
        overlay: {
            container: 'rill-overlay',
            backdrop: 'rill-overlay-backdrop',
            content: 'rill-overlay-content'
        },
        inputField: 'rill-input-field',
        input: 'rill-input',
        controlGroup: 'rill-control-group',
        controls: {
            control: 'rill-control',
            indicator: 'rill-control-indicator',
            indicatorChild: 'rill-control-indicator-child',
            switch: 'rill-switch',
            switchInnerText: 'rill-switch-inner-text',
            checkbox: 'rill-checkbox'
        },
        label: 'rill-label',
        help: 'rill-help-text',
        menu: {
            container: 'rill-menu',
            divider: 'rill-menu-divider',
            item: 'rill-menu-item'
        },
        panel: 'rill-panel',
        dialog: 'rill-dialog',
        intents: {
            primary: 'rill-intent-primary',
            warning: 'rill-intent-warning',
            danger: 'rill-intent-danger',
            success: 'rill-intent-success',
        },
        inline: 'rill-inline',
        fill: 'rill-fill',
        round: 'rill-round',
        textMuted: 'rill-text-muted',
        textDebug: 'rill-text-debug',
        node: {
            container: 'rill-node-edit',
            header: 'rill-node-edit-header',
            content: 'rill-node-edit-content',
            error: 'rill-node-edit-error'
        },
        icon: 'rill-icon',
        button: 'rill-button',
        buttonText: 'rill-button-text',
        buttonGroup: 'rill-button-group',
        controlsPanel: 'rill-controls-panel',
        controlsPanelBlock: 'rill-controls-panel-block',
        resizer: 'rill-resizer',
        // States
        active: 'rill-active',
        disabled: 'rill-disabled',
        selected: 'rill-selected',
        target: 'rill-target',
        error: 'rill-error'
    },
    canvas: {
        grid: {
            step: 10,
            small: 'rill-canvas-grid-small',
            large: 'rill-canvas-grid-large'
        },
        connection: {
            base: 'rill-canvas-connection',
            flow: 'rill-canvas-connection-flow',
            value: 'rill-canvas-connection-value'
        },
        node: {
            minHeight: 50,
            panel: 'rill-canvas-node-panel',
            header: {
                height: 25,
                base: 'rill-canvas-node-header-base',
                text: 'rill-canvas-node-header-text',
                overlay: 'rill-canvas-node-header-overlay'
            },
            ports: {
                base: 'rill-canvas-node-port',
                flow: {
                    width: 6,
                    height: 26,
                    class: 'rill-canvas-node-port-flow'
                },
                value: {
                    width: 4,
                    height: 20,
                    class: 'rill-canvas-node-port-value'
                },
                text: 'rill-canvas-node-port-text'
            },
            error: {
                class: 'rill-canvas-node-error-icon',
                icon: 'error',
                offset: 10
            },
            desc: 'rill-canvas-node-desc'
        },
        lasso: 'rill-canvas-lasso'
    },
    filters: {
        shadows: {
            shadow: {
                // Using smaller values results in CUT of shadow path
                // when filterUnits is userSpaceOnUse. However, if used
                // objectBoundingBox in the filterUnits - it cuts when lines
                // are horizontal or vertical, so we use this unit type.
                x: defaultOptions.design.boundingBox.x,
                y: defaultOptions.design.boundingBox.y,
                width: defaultOptions.design.boundingBox.width,
                height: defaultOptions.design.boundingBox.height,
                dx: 5,
                dy: 5,
                filterUnits: 'userSpaceOnUse',
                stdDeviation: 4,
                floodColor: 'black',
                floodOpacity: 0.5
            },
            textShadow: {
                dx: 1,
                dy: 1,
                filterUnits: 'userSpaceOnUse',
                stdDeviation: 1,
                floodColor: 'black',
                floodOpacity: 0.75
            }
        },
        gradients: {
            headerGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 100,
                stops: [
                    {
                        offset: 0,
                        stopColor: 'rgba(0,0,0,0.2)'
                    },
                    {
                        offset: 33,
                        stopColor: 'rgba(0,0,0,0)'
                    },
                    {
                        offset: 67,
                        stopColor: 'rgba(0,0,0,0)'
                    },
                    {
                        offset: 100,
                        stopColor: 'rgba(0,0,0,0.2)'
                    },
                ]
            }          
        }
    }
};

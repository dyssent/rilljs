import React, { useContext, useMemo } from 'react';

import { ModelActions, ModelActionsContext } from '../model';
import { Node } from '../../model';
import { Theme, ThemeContext } from '../theme';
import { Options, OptionsContext } from '../options';
import { NodeDrawer } from '../Drawers';

export interface NodeEditProps {
    node: Node;
    invalid?: string;
}

export const NodeEdit = React.memo((props: NodeEditProps) => {
    const {
        node,
        invalid
    } = props;

    const theme = useContext<Theme>(ThemeContext);
    const actions = useContext<ModelActions>(ModelActionsContext);
    const options = useContext<Options>(OptionsContext);

    const Drawer = useMemo(() => {
        const NativeDrawer = options.drawers.nodes[node.defn.class];
        return NativeDrawer || NodeDrawer;
    }, [node.defn.class, options]);

    return (
        <Drawer
            node={node}
            actions={actions}
            options={options}
            theme={theme}
            invalid={invalid}
        />
    );
});

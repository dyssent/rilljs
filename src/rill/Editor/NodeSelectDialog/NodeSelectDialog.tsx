import React from 'react';

import { NodeSelect } from '../NodeSelect';
import { Node } from '../../model';
import { DialogProps, Dialog } from '../Components';

export interface NodeSelectDialogProps extends DialogProps {
    onSelect?: (nodeTypeID: string) => void;
    predicate?: (node: Node) => boolean;
}

export const NodeSelectDialog = React.memo((props: NodeSelectDialogProps) => {
    const {
        isOpen,
        title,
        onSelect,
        usePortal,
        onClose,
        predicate
    } = props;

    function onNodeSelect(node: Node) {
        if (!onSelect) {
            return;
        }
        onSelect(node.defn.class);
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            usePortal={usePortal}
        >
            <NodeSelect
                onSelect={onNodeSelect}
                predicate={predicate}
            />
        </Dialog>
    );    
});

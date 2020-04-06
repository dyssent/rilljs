import React, { useContext } from 'react';
import { Button } from '../Components';
import { ModelActions, ModelActionsContext } from '../model';

export const ZoomIn = React.memo(() => {
    const actions = useContext<ModelActions>(ModelActionsContext);

    function onClick() {
        actions.zoom(
            actions.getZoom() + 0.1
        );
    }
    return (
        <Button
            icon="zoom-in"
            onClick={onClick}
            title="Zoom In"
        />
    );
});

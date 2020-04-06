import React, { useContext } from 'react';
import { Button } from '../Components';
import { ModelActions, ModelActionsContext } from '../model';

export const ResetZoom = React.memo(() => {
    const actions = useContext<ModelActions>(ModelActionsContext);

    function onClick() {
        actions.zoom(1.0);
    }
    return (
        <Button
            icon="zoom-to-fit"
            onClick={onClick}
            title="Reset Zoom"
        />
    );
});

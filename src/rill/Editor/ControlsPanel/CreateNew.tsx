import React, { useContext } from 'react';

import { Button } from '../Components';
import { EditorDialogs, EditorDialogsContext } from '../ref';

export const CreateNew = React.memo(() => {

    const editoDialogs = useContext<EditorDialogs>(EditorDialogsContext);

    function onClick() {
        editoDialogs.openCreateDialog();
    }
    return (
        <Button
            icon="plus"
            onClick={onClick}
            title="Add new node"
        />
    );
});

import React, { useContext } from 'react';
import { Button } from '../Components';
import { EditorDialogs, EditorDialogsContext } from '../ref';

export const InsertSnippet = React.memo(() => {

    const editoDialogs = useContext<EditorDialogs>(EditorDialogsContext);

    function onClick() {
        editoDialogs.openSnippetDialog();
    }
    return (
        <Button
            icon="search-template"
            onClick={onClick}
            title="Insert snippet"
        />
    );
});

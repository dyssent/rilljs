import React, { useState } from 'react';
import { Button } from '../Components';

export interface FullScreenProps {
    editorElement: HTMLElement;
}

export const FullScreen = React.memo((props: FullScreenProps) => {
    const {
        editorElement
    } = props;

    const [maximized, setMaximized] = useState(false);
    function onClick() {
        if (document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setMaximized(false);
            }
        } else {
            if (editorElement.requestFullscreen) {
                editorElement.requestFullscreen();
                setMaximized(true);
            }
        }
    }

    // TODO Just maximized is not reliable, as it is possible to exit fullscreen
    // using keyboard ESC button or other window controls.
    // const isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null);

    return (
        <Button
            icon={maximized ? 'minimize' : 'fullscreen'}
            title="Fullscreen"
            onClick={onClick}
        />
    );
});

import React, { useContext } from 'react';

import { Theme, ThemeContext } from '../../theme';
import { mergeClasses } from '../utils';
import { Overlay } from '../Overlay';

export interface DialogProps {
    isOpen: boolean;
    title?: string | JSX.Element;
    usePortal?: boolean;
    onClose?: () => void;
}

export const Dialog = React.memo((props: React.PropsWithChildren<DialogProps>) => {
    const {
        isOpen,
        onClose,
        title,
        children,
        usePortal
    } = props;

    const theme = useContext<Theme>(ThemeContext).classes;
    const classes = mergeClasses(theme.panel, theme.dialog);

    return (
        <Overlay
            isOpen={isOpen}
            onClose={onClose}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            usePortal={usePortal}
        >
            <div className={classes} >
                {
                    title &&
                    (
                        typeof title === 'string' ?
                            <h2 className={theme.heading}>
                                {title}
                            </h2> :
                            title
                    )
                }
                {
                    children
                }
            </div>
        </Overlay>
    );    
});

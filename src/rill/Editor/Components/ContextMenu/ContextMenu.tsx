import React, {
    useState,
    useEffect,
    useRef
} from 'react';

import { Coords } from '../../../model';
import { Overlay } from '../Overlay';
import { BaseProps } from '../props';
import { mergeClasses } from '../utils';

export const CONTEXT_DISMISS_CLASS = 'context-dismiss';

export interface ContextMenuProps extends BaseProps {
    usePortal?: boolean;
    menu?: JSX.Element;
    target: HTMLElement | undefined | null;
    disabled?: boolean;
    dismissOnChildrenClick?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

export function ContextMenu(props: React.PropsWithChildren<ContextMenuProps>) {
    const {
        menu,
        usePortal = true,
        target,
        children,
        disabled,
        onOpen,
        onClose,
        dismissOnChildrenClick = true,
        className,
        style
    } = props;

    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [offset, setOffset] = useState<Coords>({x: 0, y: 0});

    function onOverlayClose() {
        if (!open) {
            return;
        }
        setOpen(false);
        if (onClose) {
            onClose();
        }
    }

    useEffect(() => {
        if (!target || disabled) {
            return;
        }

        function onContextMenu(event: MouseEvent) {
            if (open) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            setOpen(true);

            if (target) {
                const br = target.getBoundingClientRect();
                
                if (usePortal) {
                    setOffset({
                        x: event.clientX,
                        y: event.clientY
                    });
                } else {
                    // if not in portal, we need to calcualte correct position                    
                    setOffset({
                        x: event.clientX - br.left,
                        y: event.clientY - br.top
                    });    
                }
            }

            if (onOpen) {
                onOpen();
            }
        }

        target.addEventListener('contextmenu', onContextMenu);
        return () => {
            target.removeEventListener('contextmenu', onContextMenu);
        };
    }, [target, onOpen, disabled]);
    
    function handleContentClick(e: React.MouseEvent<HTMLElement>) {
        if (!open) {
            return;
        }

        const eventTarget = e.target as HTMLElement;
        const parentWithDismiss = eventTarget.classList.contains(CONTEXT_DISMISS_CLASS) ||
            eventTarget.closest(`.${CONTEXT_DISMISS_CLASS}`);
        if (!parentWithDismiss) {
            return;
        }

        setOpen(false);
    };

    return (
        <Overlay
            isOpen={open && !disabled}
            usePortal={usePortal}
            canEscapeKeyClose={true}
            canOutsideClickClose={true}
            onClose={onOverlayClose}
            hasBackdrop={false}
        >
            <div
                ref={ref}
                className={mergeClasses(className, {
                    [CONTEXT_DISMISS_CLASS]: dismissOnChildrenClick
                })}
                style={{
                    position: 'absolute',
                    left: offset.x,
                    top: offset.y,
                    ...{style}
                }}
                onClick={handleContentClick}
            >
                {menu}
                {children}
            </div>
        </Overlay>
    );
}

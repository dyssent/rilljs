import React, {
  CSSProperties,
  useState,
  useEffect,
  useRef,
  useContext
} from 'react';

import { Portal } from './Portal';
import { Theme, ThemeContext } from '../../theme';
import { Keys } from '../keys';
import { bringFocus } from '../utils';

export interface OverlayProps {
  hasBackdrop?: boolean;
  usePortal?: boolean;

  autoFocus?: boolean;
  enforceFocus?: boolean;

  canEscapeKeyClose?: boolean;
  canOutsideClickClose?: boolean;

  isOpen?: boolean;
  lazy?: boolean;
  onClose?: () => void;

  style?: CSSProperties;
}

export const Overlay = React.memo((props: React.PropsWithChildren<OverlayProps>) => {
  const {
    hasBackdrop = true,
    usePortal = true,

    autoFocus = true,
    enforceFocus = false,

    canEscapeKeyClose = true,
    canOutsideClickClose = true,

    lazy = true,
    isOpen,
    onClose,
    style
  } = props;

  const theme = useContext<Theme>(ThemeContext).classes.overlay;
  const containerRef = useRef<HTMLDivElement>(null);
  const [wasEverOpened, setWasEverOpened] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!wasEverOpened) {
      setWasEverOpened(true);
    }

    if (autoFocus) {
      bringFocus(containerRef.current);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!canEscapeKeyClose || !onClose) {
        return;
      }

      if (event.which === Keys.Esc) {
        onClose();
        event.preventDefault();
      }
    }

    function onFocus(event: FocusEvent) {
      if (!enforceFocus ||
          !(event.target instanceof Node) ||
          !containerRef.current ||
          containerRef.current.contains(event.target as HTMLElement)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      bringFocus(containerRef.current);
    }

    function onDocumentClick(event: MouseEvent) {
      if (!containerRef.current || !canOutsideClickClose || !onClose) {
        return;
      }

      const eventTarget = event.target as HTMLElement;
      const isDescendant = containerRef.current.contains(eventTarget) && !containerRef.current.isSameNode(eventTarget);
      if (!isDescendant) {
        onClose();
      }
    }

    if (enforceFocus) {
      document.addEventListener('focus', onFocus, true);
    }
    
    if (canEscapeKeyClose) {
      document.addEventListener('keydown', onKeyDown, true);
    }
    
    if (canOutsideClickClose) {
      document.addEventListener("mousedown", onDocumentClick, true);
    }
    
    return () => {
      if (canEscapeKeyClose) {
        document.removeEventListener('keydown', onKeyDown, true);
      }

      if (enforceFocus) {
        document.removeEventListener('focus', onFocus, true);
      }

      if (canOutsideClickClose) {
        document.removeEventListener("mousedown", onDocumentClick, true);
      }
    };
  }, [
    isOpen,
    autoFocus,
    wasEverOpened,
    canOutsideClickClose,
    canEscapeKeyClose,
    enforceFocus,
    onClose,
    hasBackdrop
  ]);

  if (!wasEverOpened && lazy) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  const content = (
    <div className={theme.container}>
        {
          hasBackdrop &&
          <div
            className={theme.backdrop}
          />
        }
        <div
          ref={containerRef}
          className={theme.content}
          style={style}
        >
          {props.children}
        </div>
      </div>
  );

  return usePortal ?
          <Portal>
            {content}
          </Portal>
          : content;
});

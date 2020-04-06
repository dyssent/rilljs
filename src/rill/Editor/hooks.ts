import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { Rect, rectsEqual } from '../model';

function getClientDims<E extends Element= Element>(ref: React.RefObject<E>) {
    if (!ref.current) {
        return undefined;
    }

    const rect = ref.current.getBoundingClientRect();
    return {
        x: 0, //rect.x,
        y: 0, // rect.y,
        width: rect.width,
        height: rect.height
    };
}

export function useDimensions<E extends Element= Element>(): [React.RefObject<E>, Rect] {
    const ref = useRef<E>(null);
    const [dims, setDims] = useState<Rect>({x: 0, y: 0, width: 0, height: 0});

    useLayoutEffect(() => {
        const newDims = getClientDims(ref);
        if (!newDims) {
            return;
        }
        if (!rectsEqual(newDims, dims)) {
            setDims(newDims);
        }
    }, [ref, dims]);

    // TODO Use window resize function to recalc the dims in case it changes
    // useEffect(() => {
    //     function onResize() {
    //         const newDims = getClientDims(ref);
    //         if (!newDims) {
    //             return;
    //         }
    //         setDims(newDims);
    //     }

    //     window.addEventListener('resize', onResize);
    //     return () => {
    //         window.removeEventListener('resize', onResize);
    //     };
    // }, []);

    return [ref, dims];
}

export function useResizeObservable<E extends Element= Element>(ref: React.RefObject<E>): Rect {
    const [dims, setDims] = useState<Rect>({x: 0, y: 0, width: 0, height: 0});

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        if (!ResizeObserver) {
            const newDims = getClientDims(ref);
            if (!newDims) {
                return;
            }
            if (!rectsEqual(newDims, dims)) {
                setDims(newDims);
            }
            return;
        }

        const observer = new ResizeObserver(entries => {
            if (!Array.isArray(entries)) {
              return;
            }
      
            // Since we only observe the one element, we don't need to loop over the
            // array
            if (!entries.length) {
              return;
            }
      
            const entry = entries[0];
            const newDims = {
                x: entry.contentRect.x,
                y: entry.contentRect.y,
                width: Math.round(entry.contentRect.width),
                height: Math.round(entry.contentRect.height),
            }
            if (
                dims.width !== newDims.width ||
                dims.height !== newDims.height
            ) {
                setDims(newDims);
                //   if (onResize) {
                //     onResize(newSize);
                //   } else {
                //     previous.current.width = newWidth;
                //     previous.current.height = newHeight;
                //     setSize(newSize);
                //   }
            }
        });

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [ref, dims]);
    return dims;
}

// Alternative example: https://github.com/asyarb/use-resize-observer/blob/master/src/index.tsx

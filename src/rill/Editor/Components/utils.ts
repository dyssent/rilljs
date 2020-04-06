
export function mergeDeep(target: any, source: any, clone?: boolean) {
    const isObject = (obj: unknown) => obj && typeof obj === 'object';
  
    if (!isObject(target) || !isObject(source)) {
      return target || source;
    }

    const res = clone ? JSON.parse(JSON.stringify(target)) : target;
    Object.keys(source).forEach(key => {
      const targetValue = res[key];
      const sourceValue = source[key];
  
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        res[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        res[key] = mergeDeep(targetValue, sourceValue);
      } else {
        res[key] = sourceValue;
      }
    });
  
    return res;
}


export function mergeClassesRaw(...classes: Array<unknown>) {
    const res: string[] = [];
    for (let ci = 0; ci < classes.length; ci++) {
        const c = classes[ci];
        switch (typeof c) {
            case 'number': res.push(c.toString()); break;
            case 'string': res.push(c); break;
            case 'object':
                if (Array.isArray(c)) {
                    const ca = c as Array<unknown>;
                    res.push(
                        ...mergeClassesRaw(...ca)
                    );
                } else if (c !== null){
                    const co = c as {[key: string]: unknown};
                    Object.keys(c).forEach(key => {
                        if (co[key]) {
                            res.push(key);
                        }
                    });
                }
            break;
            default:
                // This is a wrong type, ignore it
        }
    }
    return res;
}

export function mergeClasses(...classes: Array<unknown>) {
    const res: string[] = mergeClassesRaw(classes);
    return res.join(' ');
}

export function isInFocus(container: HTMLElement | undefined | null, element: HTMLElement | undefined | null): boolean {
    if (!container || !element) {
        return false;
    }

    return !container.contains(element);
}

export function bringFocus(container: HTMLElement | undefined | null) {
    // avoid scroll jumps
    return requestAnimationFrame(() => {
        if (!container || document.activeElement == null) {
            return;
        }
  
        const isFocusOutside = !container.contains(document.activeElement);
        if (isFocusOutside) {
            // autofocus first, then other elements
            const autofocusEl = container.querySelector("[autofocus]") as HTMLElement;
            const wrapperEl = container.querySelector("[tabindex]") as HTMLElement;
            if (autofocusEl != null) {
              autofocusEl.focus();
            } else
            if (wrapperEl != null) {
              wrapperEl.focus();
            }
        }
    });
}

export function scrollIntoView(ref: HTMLElement | undefined | null, index: number): boolean {
    if (!ref) {
        return false;
    }
    
    if (index >= ref.children.length) {
        return false;
    }

    const childElement = ref.children.item(index) as HTMLElement;
    if (!childElement) {
        return false;
    }

    function pixelsToNumber(value: string | null) {
        return value == null ? 0 : parseInt(value.slice(0, -2), 10);
    }
        
    function getPadding(el: HTMLElement) {
        const { paddingTop, paddingBottom } = getComputedStyle(el);
        return {
            paddingBottom: pixelsToNumber(paddingBottom),
            paddingTop: pixelsToNumber(paddingTop),
        };
    }

    const {
        offsetTop: activeTop,
        offsetHeight: activeHeight
    } = childElement;

    const {
        offsetTop: parentOffsetTop,
        scrollTop: parentScrollTop,
        clientHeight: parentHeight,
    } = ref;

    const {
        paddingTop,
        paddingBottom
    } = getPadding(ref);

    const bottomEdge = activeTop + activeHeight + paddingBottom - parentOffsetTop;
    const activeTopEdge = activeTop - paddingTop - parentOffsetTop;        

    if (bottomEdge >= parentScrollTop + parentHeight) {
        // align item bottom to the ref bottom
        ref.scrollTop = bottomEdge + activeHeight - parentHeight;
    } else if (activeTopEdge <= parentScrollTop) {
        // align item top to the ref top
        ref.scrollTop = activeTopEdge - activeHeight;
    }
    return true;
}

import { Coords } from './coords';
import { Dimensions } from './dimensions';

export interface Rect extends Coords, Dimensions {
}

export interface RectBox {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export function rectToBox(rect: Rect): RectBox {
    return {
        left: rect.x,
        right: rect.x + rect.width,
        top: rect.y,
        bottom: rect.y + rect.height
    };
}

const zeroOffset: Coords = {
    x: 0,
    y: 0
};

export function rectFromPoints(pt1: Coords, pt2: Coords, offset: Coords = zeroOffset): Rect {
    return {
        x: Math.min(pt1.x, pt2.x) - offset.x,
        y: Math.min(pt1.y, pt2.y) - offset.y,
        width: Math.abs(Math.abs(pt1.x) - Math.abs(pt2.x)),
        height: Math.abs(Math.abs(pt1.y) - Math.abs(pt2.y))
    };
}

export function rectsOverlap(rect1: Rect, rect2: Rect): boolean {
    const box1 = rectToBox(rect1);
    const box2 = rectToBox(rect2);

    if (box1.right < box2.left || box2.right < box1.left) {
        return false;
    }

    if (box1.bottom < box2.top || box2.bottom < box1.top) {
        return false;
    }

    return true;
}

export function rectsEqual(rect1: Rect, rect2: Rect): boolean {
    return rect1.x === rect2.x &&
        rect1.y === rect2.y &&
        rect1.width === rect2.width &&
        rect1.height === rect2.height;
}

export function coordsInRect(c: Coords, r: Rect): boolean {
    return c.x >= r.x && c.x <= r.x + r.width && c.y >= r.y && c.y <= r.y + r.height;
}

export interface Coords {
    x: number;
    y: number;
}

export function distance(c1: Coords, c2: Coords): number {
    return Math.sqrt(
        Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2)
    );
}
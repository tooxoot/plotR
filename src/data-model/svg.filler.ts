import { XY } from './svg.model';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { ClipUtils, ClipType } from './svg.clipping';

export interface Progression {
    start: DrawInitials;
    bounding: [XY, XY];
    previousResultsBounding?: Bounding;
    next(currentInitials: DrawInitials): DrawInitials;
}

export interface DrawInitials {
    position: XY;
    angle?: number;
}

export interface Bounding {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
}

export function clipFilling(
    fillingElements: GT.DrawableElement[],
    boundingElement: GT.DrawableElement,
    regardClosing: boolean = true
): GT.DrawableElement[] {
    const clippedFillings: GT.DrawableElement[] = [];

    fillingElements.forEach( fillingElement => {
        const results = ClipUtils.clipTwo(fillingElement, boundingElement, regardClosing, ClipType.Intersect);
        clippedFillings.push(...results);
    });

    return clippedFillings;
}

export function createFillingElements(
    progression: Progression,
    drawingCallback: (dI: DrawInitials) => GT.DrawableElement[] ): GT.DrawableElement[] {
    const result: GT.DrawableElement[] = [];
    // let delta = progression.delta;
    let currentInitials: DrawInitials = progression.start;

    while (currentInitials) {
        result.push(...drawingCallback(currentInitials));
        currentInitials = progression.next(currentInitials);
    }

    return result;
}

export function getBoundingBox(...modelElements: GT.DrawableElement[]): Bounding {
    const initialBounding = {
        minX: Number.MAX_VALUE,
        maxX: Number.MIN_VALUE,
        minY: Number.MAX_VALUE,
        maxY: Number.MIN_VALUE
    };

    const bounding = modelElements.reduce(
        (currentBounding: Bounding, element) => {
            element.points.forEach(point => {
                if (point.X < currentBounding.minX) { currentBounding.minX = point.X; }
                if (point.X > currentBounding.maxX) { currentBounding.maxX = point.X; }
                if (point.Y < currentBounding.minY) { currentBounding.minY = point.Y; }
                if (point.Y > currentBounding.maxY) { currentBounding.maxY = point.Y; }
            });

            return currentBounding;
        },
        initialBounding
    );

    return bounding;
}

export function add(...vectors: XY[]): XY {
    return vectors.reduce((acc, val) => ({X: acc.X + val.X, Y: acc.Y + val.Y  }), {X: 0, Y: 0});
}

export function subtract(...vectors: XY[]): XY {
    return vectors.reduce((acc, val) => ({X: acc.X - val.X, Y: acc.Y - val.Y  }));
}

export function scale(scalar: number, vector: XY): XY {
    return {X: vector.X * scalar, Y: vector.Y * scalar};
}

export function rotate(center: XY, p: XY, angle: number): XY {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const newX = (cos * (p.X - center.X)) + (sin * (p.Y - center.Y)) + center.X;
    const newY = (cos * (p.Y - center.Y)) - (sin * (p.X - center.X)) + center.Y;

    return {X: newX, Y: newY};
}

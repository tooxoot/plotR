import {XY, ModelElement, MODEL} from './svg.model'
import { element } from 'protractor';
import {ClipUtils, ClipType} from './svg.clipping'

export interface Progression {
    start: DrawInitials;
    // delta: XY;
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

export function clipFilling(fillingElements: ModelElement[], boundingElement: ModelElement, regardClosing = false): ModelElement[] {
    const clippedFillings: ModelElement[] = [];

    fillingElements.forEach( fillingElement => {
        const results = ClipUtils.clipTwo(fillingElement, boundingElement, regardClosing, ClipType.Intersect);
        clippedFillings.push(...results);
    });

    return clippedFillings;
}

export function createFillingElements(progression: Progression, drawingCallback: (DrawInitials) => ModelElement[] ): ModelElement[] {
    const result: ModelElement[] = [];
    // let delta = progression.delta;
    let currentInitials: DrawInitials = progression.start;

    while (currentInitials) {
        result.push(...drawingCallback(currentInitials));
        currentInitials = progression.next(currentInitials);
    }

    return result;
}


function checkBounding(point: XY, bounding: Bounding): boolean {
    const fitsMaxX = bounding.maxX ? (point.X <= bounding.maxX) : true;
    const fitsMaxY = bounding.maxY ? (point.Y <= bounding.maxY) : true;
    const fitsMinX = bounding.minX ? (point.X >= bounding.minX) : true;
    const fitsMinY = bounding.minY ? (point.Y >= bounding.minY) : true;

    return fitsMaxX && fitsMaxY && fitsMinX && fitsMinY;
}

function checkBoundingOverlap(boundingA: Bounding, boundingB: Bounding) {
    const pointA = {X: boundingA.minX, Y: boundingA.minY}
    const pointB = {X: boundingA.maxX, Y: boundingA.minY}
    const pointC = {X: boundingA.maxX, Y: boundingA.maxY}
    const pointD = {X: boundingA.minX, Y: boundingA.maxY}

    const pointAInBoundingB = checkBounding(pointA, boundingB);
    const pointBInBoundingB = checkBounding(pointB, boundingB);
    const pointCInBoundingB = checkBounding(pointC, boundingB);
    const pointDInBoundingB = checkBounding(pointD, boundingB);

    return pointAInBoundingB || pointBInBoundingB || pointCInBoundingB || pointDInBoundingB;
}

export function getBoundingBox(...modelElements: ModelElement[]): Bounding {
    const initialBounding = {
        minX: Number.MAX_VALUE,
        maxX: Number.MIN_VALUE,
        minY: Number.MAX_VALUE,
        maxY: Number.MIN_VALUE
    }

    const bounding = modelElements.reduce((currentBounding: Bounding, element) => {
        element.points.forEach(point => {
            if (point.X < currentBounding.minX) { currentBounding.minX = point.X; }
            if (point.X > currentBounding.maxX) { currentBounding.maxX = point.X; }
            if (point.Y < currentBounding.minY) { currentBounding.minY = point.Y; }
            if (point.Y > currentBounding.maxY) { currentBounding.maxY = point.Y; }
        })

        return currentBounding;
    }, initialBounding);

    return bounding;
}

function test() {
    const a = [{X: 0, Y: 0}, {X: 0, Y: 0}];
    const b = [{X: Number.MIN_VALUE, Y: Number.MIN_VALUE}, {X: Number.MAX_VALUE, Y: Number.MAX_VALUE}]
}


export function add(...vectors: XY[]): XY {
    return vectors.reduce((acc, val) => ({X: acc.X + val.X, Y: acc.Y + val.Y  }), {X: 0, Y: 0})
}

export function subtract(...vectors: XY[]): XY {
    return vectors.reduce((acc, val) => ({X: acc.X - val.X, Y: acc.Y - val.Y  }));
}

export function scale(scalar: number, vector: XY): XY {
    return {X: vector.X * scalar, Y: vector.Y * scalar}
}

export function rotate(center: XY, p: XY, angle: number): XY {
    const radians = (Math.PI / 180) * angle
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    const newX = (cos * (p.X - center.X)) + (sin * (p.Y - center.Y)) + center.X;
    const newY = (cos * (p.Y - center.Y)) - (sin * (p.X - center.X)) + center.Y;

    return {X: newX, Y: newY};
}

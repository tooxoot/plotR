import {XY, ModelElement, MODEL, getNextId} from './svg.model'

interface Progression {
    start: DrawInitials;
    // delta: XY;
    bounding: [XY, XY];
    next(currentInitials: DrawInitials): DrawInitials;
}

interface DrawInitials {
    position: XY;
    angle?: number;
}

function createFillingElements(progression: Progression, drawingCallback: (DrawInitials) => ModelElement[] ): ModelElement[] {
    const result: ModelElement[] = [];
    // let delta = progression.delta;
    let initials: DrawInitials = progression.start;

    while (initials) {
        result.push(...drawingCallback(initials));
        initials = progression.next(initials);
    }

    return result;
}

function getLinearProgression(start: DrawInitials, delta: XY, bounding: [XY, XY], bidirectional: boolean = false): Progression {
    let stepCount = 0;

    const next = (currentInitials: DrawInitials) => {
        stepCount++;

        return { position: add(currentInitials.position, delta)};

    }

    return {
        start: start,
        bounding: bounding,
        next: next
    }
}

function drawLines(progression: Progression, angle: number): ModelElement[] {
    const result: ModelElement[] = []

    const drawLine = getDrawLineCallBack(angle);

    return createFillingElements(progression, drawLine);
}

function getDrawLineCallBack(angle: number): (initials: DrawInitials) => ModelElement[] {
    const dimX = MODEL.dimensions.X;
    const dimY = MODEL.dimensions.Y;
    const center = {X: dimX / 2, Y: dimY / 2};

    let lEnd = {X: 0, Y: dimY / 2};
    let rEnd = {X: dimX, Y: dimY / 2};

    lEnd = rotate(center, lEnd, angle);
    rEnd = rotate(center, rEnd, angle);

    return function(initials: DrawInitials): ModelElement[] {
        const delta = {X: center.X - initials.position.X, Y: center.Y - initials.position.Y};
        const p1 = add(lEnd, delta)
        const p2 = add(rEnd, delta)

        return [{
            points: [p1, p2],
            id: getNextId(),
            filled: false,
            outlined: true,
            closed: false,
        }]
    }
}

function checkBounding(point: XY, bounding: [XY, XY]): boolean {
    return checkXY(point, bounding[1].X, bounding[1].Y, bounding[0].X, bounding[1].X);
}
function checkXY(point: XY, maxX?: number, maxY?: number, minX?: number, minY?: number): boolean {
    const fitsMaxX = maxX ? (point.X <= maxX) : true;
    const fitsMaxY = maxY ? (point.Y <= maxY) : true;
    const fitsMinX = minX ? (point.X >= minX) : true;
    const fitsMinY = minY ? (point.Y >= minY) : true;

    return fitsMaxX && fitsMaxY && fitsMinX && fitsMinY;
}

function add(...vectors: XY[]): XY {
    return vectors.reduce((acc, val) => ({X: acc.X + val.X, Y: acc.Y + val.Y  }), {X: 0, Y: 0})
}

function rotate(center: XY, p: XY, angle: number): XY {
    const radians = (Math.PI / 180) * angle
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    const newX = (cos * (p.X - center.X)) + (sin * (p.Y - center.Y)) + center.X;
    const newY = (cos * (p.Y - center.Y)) - (sin * (p.X - center.X)) + center.Y;

    return {X: newX, Y: newY};
}

import { XY } from './svg.model';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import {
    scale,
    clipFilling,
    DrawInitials,
    Progression,
    createFillingNodes,
    add,
    rotate,
    getBoundingBox
} from './svg.filler';

export function createSimpleLineFilling(
    filledNode: TT.DrawableNode,
    angle: number,
    spacing: number,
    offset: number,
    dimensions: TT.Dimensions,
): TT.DrawableNode[] {
    /*
    Note Lines should be orthogonal to progression
    For lines:          angle = 0 => vl = [0,1]
    For Progression:    angle = 0 => vp = [1,0]
    => vp = vp * spacing
    => rotate both with angle
    */

    const zeroZero = {X: 0, Y: 0};

    const filledBounds = getBoundingBox(filledNode);
    const filledDimX = filledBounds.maxX - filledBounds.minX;
    const filledDimY = filledBounds.maxY - filledBounds.minY;

    const rotatedOffset = rotate(zeroZero, {X: offset, Y: 0}, angle);
    const progressionStart = { position: {
        X: (filledBounds.maxX + filledBounds.minX) / 2 + rotatedOffset.X,
        Y: (filledBounds.maxY + filledBounds.minY) / 2 + rotatedOffset.Y
    }};

    const vp = rotate(zeroZero, {X: spacing, Y: 0}, angle);
    const halfDiagonalPlusOffset = 0.5 * (filledDimX ** 2 + filledDimY **  2) ** 0.5 + offset;
    const progressionCount =   halfDiagonalPlusOffset / spacing;

    const progression = countedVectorProgression({
        startingInitials: progressionStart,
        vector: vp,
        maxCount: progressionCount,
        bidirectional: true,
    });

    const drawingCallback = getDrawLineCallBack(dimensions, angle);
    const lines = createFillingNodes(progression, drawingCallback);
    console.log(lines);

    const clippedLines = clipFilling(lines, filledNode);

    return clippedLines;
}

function countedVectorProgression (args: {
        startingInitials: DrawInitials;
        vector: XY;
        maxCount: number;
        bidirectional: true;
    }): Progression {
    let stepR = 0;
    let stepL = 0;

    const next = (currentInitials: DrawInitials) => {
        if (stepR++ < args.maxCount) {
            return {
                position: add(args.startingInitials.position, scale(stepR, args.vector)),
                angle: currentInitials.angle
            };
        }
        if (!args.bidirectional) { return null; }
        if (stepL++ < args.maxCount) {
            return {
                position: add(args.startingInitials.position, scale(-stepL, args.vector)),
                angle: currentInitials.angle
            };
        }
        return null;
    };

    return {
        start: args.startingInitials,
        bounding: null,
        next: next
    };
}

function getDrawLineCallBack(
    dimensions: TT.Dimensions,
    angle?: number,
): (initials: DrawInitials) => TT.DrawableNode[] {
    return function(currentInitials: DrawInitials): TT.DrawableNode[] {
        const usedAngle = angle != null ? angle : currentInitials.angle;
        const pV = rotate({X: 0, Y: 0}, {X: 0, Y: 1}, usedAngle);

        const tMinX = (0 - currentInitials.position.X) / pV.X;
        const tMinY = (0 - currentInitials.position.Y) / pV.Y;
        const tMaxX = (dimensions.X - currentInitials.position.X) / pV.X;
        const tMaxY = (dimensions.Y - currentInitials.position.Y) / pV.Y;

        const tMin = isFinite(tMinX) ? tMinX : tMinY;
        const tMax = isFinite(tMaxX) ? tMaxX : tMaxY;

        const pR = add(currentInitials.position , {X: tMax * pV.X, Y: tMax * pV.Y});
        const pL = add(currentInitials.position , {X: tMin * pV.X, Y: tMin * pV.Y});

        return [TT.newDrawableNode({
            paths: [[pR, pL]],
            filled: false,
            outlined: true,
            closed: [false],
        })];
    };
}

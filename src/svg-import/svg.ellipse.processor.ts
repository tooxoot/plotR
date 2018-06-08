import { ChildResult } from './svg.input.processor';
import { MathUtils as MU } from '../utils/math.utils';

export const processCircleElement = (svgChild: HTMLElement): ChildResult => ({
    paths: [MU.calculateEllipsePoints(
        +(svgChild.getAttribute('cx')),
        +(svgChild.getAttribute('cy')),
        +(svgChild.getAttribute('r')),
        +(svgChild.getAttribute('r'))
    ).map(MU.toXY)],
    closed: [true],
});

export const processEllipseElement = (svgChild: HTMLElement): ChildResult => ({
    paths: [MU.calculateEllipsePoints(
        +(svgChild.getAttribute('cx')),
        +(svgChild.getAttribute('cy')),
        +(svgChild.getAttribute('rx')),
        +(svgChild.getAttribute('ry'))
    ).map(MU.toXY)],
    closed: [true]
});

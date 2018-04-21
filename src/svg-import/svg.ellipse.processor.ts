import { XY } from '../data-model/svg.model';
import { ChildResult } from './svg.input.processor';

export const processCircleElement = (svgChild: HTMLElement): ChildResult => calculateEllipse(
    +(svgChild.getAttribute('cx')),
    +(svgChild.getAttribute('cy')),
    +(svgChild.getAttribute('r')),
    +(svgChild.getAttribute('r'))
);

export const processEllipseElement = (svgChild: HTMLElement): ChildResult => calculateEllipse(
    +(svgChild.getAttribute('cx')),
    +(svgChild.getAttribute('cy')),
    +(svgChild.getAttribute('rx')),
    +(svgChild.getAttribute('ry'))
);

function calculateEllipse(cx: number, cy: number, rx: number, ry: number): ChildResult {
    const polyPoints: XY[] = [];

    for (let angle = 0; angle < 360; angle += 5) {
        const radians = (Math.PI / 180) * angle;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        polyPoints.push({
            X: rx * cos + cx,
            Y: ry * sin + cy
        });
    }

    return {
        points: polyPoints,
        closed: true
    };
}

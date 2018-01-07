import {XY} from '../data-model/svg.model'
import {ChildResult} from './svg.input.processor';

export function processLineElement(svgChild: HTMLElement): ChildResult {
    const x1 = +(svgChild.getAttribute('x1'));
    const x2 = +(svgChild.getAttribute('x2'));
    const y1 = +(svgChild.getAttribute('y1'));
    const y2 = +(svgChild.getAttribute('y2'));

    const polyPoints: XY[] = [
        {X: x1, Y: x2},
        {X: y1, Y: y2},
    ];

    return {
        points: polyPoints,
        closed: false
    }
}

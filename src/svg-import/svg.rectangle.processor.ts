import { XY } from '../data-model/svg.model';
import { ChildResult } from './svg.input.processor';

export function processRectangleElement(svgChild: HTMLElement): ChildResult {
    const x = +(svgChild.getAttribute('x'));
    const y = +(svgChild.getAttribute('y'));
    const width = +(svgChild.getAttribute('width'));
    const height = +(svgChild.getAttribute('height'));

    const polyPath: XY[] = [
        {X: x, Y: y},
        {X: x + width, Y: y},
        {X: x + width, Y: y + height},
        {X: x, Y: y + height}
    ];

    return {
        paths: [polyPath],
        closed: [true]
    };
}

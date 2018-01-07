import {XY} from '../data-model/svg.model'
import {ChildResult} from './svg.input.processor';

export function processRectangleElement(x: number, y: number, width: number, height: number): ChildResult {
    const polyPoints: XY[] = [
        {X: x, Y: y},
        {X: x + width, Y: y},
        {X: x + width, Y: y + height},
        {X: x, Y: y + height}
    ];

    return {
        points: polyPoints,
        closed: true
    }
}

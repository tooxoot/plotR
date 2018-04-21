import { XY } from '../data-model/svg.model';
import { ChildResult, extractValues } from './svg.input.processor';

export const processPolygonElement = (svgChild: HTMLElement) => processPolylineElement(svgChild, true);

export function processPolylineElement(svgChild: HTMLElement, isPolygon: boolean = false): ChildResult {
    const rawValues = svgChild.getAttribute('points');
    const coordinates = extractValues(rawValues);
    const polyPoints: XY[] = [];

    for (let idx = 0; idx < coordinates.length; idx += 2) {
        polyPoints.push({X: coordinates[idx], Y: coordinates[idx + 1]});
    }

    return {
        points: polyPoints,
        closed: isPolygon
    };
}

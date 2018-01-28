// import {splitElement, SplitResult} from './svg.element.splitter'
import { processPathElement } from './svg.path.processor';
import { processLineElement } from './svg.line.processor';
import { processPolylineElement } from './svg.polyline.processor';
import { processEllipseElement } from './svg.ellipse.processor';
import { processRectangleElement } from './svg.rectangle.processor';
import { ModelElement, XY } from '../data-model/svg.model';
import { transform } from './svg.transformation.processor';

export interface ChildResult {
    points: XY[];
    closed: boolean;
}

export function processSVG(svgRoot: HTMLElement): ModelElement[] {
    const inputResult: ModelElement[] = [];

    for (let i = 0; i < svgRoot.children.length; i++) {
        const childResult = processChild(<HTMLElement> svgRoot.children.item(i));
        inputResult.push(childResult);
    }

    return inputResult;
}

function processChild(svgChild: HTMLElement): ModelElement {
    let tempResult: ChildResult;

    switch (svgChild.tagName) {
        case 'line':
            tempResult = processLineElement(svgChild);
            break;

        case 'polyline':
            tempResult = processPolylineElement(svgChild);
            break;

        case 'polygon':
            tempResult = processPolylineElement(svgChild, true);
            break;

        case 'rect':
            tempResult = processRectangleElement(+(svgChild.getAttribute('x')),
                                                 +(svgChild.getAttribute('y')),
                                                 +(svgChild.getAttribute('width')),
                                                 +(svgChild.getAttribute('height')),
                                                );
            break;
        case 'circle':
            tempResult = processEllipseElement(+(svgChild.getAttribute('cx')),
                                               +(svgChild.getAttribute('cy')),
                                               +(svgChild.getAttribute('r')),
                                               +(svgChild.getAttribute('r'))
                                              );
            break;

        case 'ellipse':
            tempResult = processEllipseElement(+(svgChild.getAttribute('cx')),
                                               +(svgChild.getAttribute('cy')),
                                               +(svgChild.getAttribute('rx')),
                                               +(svgChild.getAttribute('ry'))
                                              );
            break;

        case 'path':
            tempResult = processPathElement(svgChild);
            break;
            default:
            console.error(`Tag-name ${svgChild} not supported!`);
            break;
    }

    if (svgChild.getAttribute('transform')) {
        tempResult.points = transform(tempResult.points, svgChild);
    }

    return {    points: tempResult.points.map(p => ({X: p.X * 100, Y: p.Y * 100}) ),
                filled: isFilled(svgChild),
                outlined: hasOutline(svgChild),
                closed: tempResult.closed
           };

}

export function extractValues(rawValues: string): number[] {
    const values: number[] = [];
    const scanForCoordinates = /[,\t ]*(-{0,1}[\d\.]{1,})/g;

    let currentMatch;
    while (currentMatch = scanForCoordinates.exec(rawValues.trim())) {
        if (currentMatch[0] === '') { break; }
        values.push( +(currentMatch[1]) );
    }
    return values;
}

/**
 * NOTE: This will also return true if the fill-style is empty and the fill attribute is invalid!
 * @param svgChild Any child element of an svg
 * @return True if the given Element is filled with color.
 */
function isFilled(svgChild: HTMLElement): boolean {
    const a: boolean = svgChild.style.fill ? true : false;
    const b: boolean = svgChild.style.fill !== 'none';
    const c: boolean = svgChild.getAttribute('fill') !== 'none' ? true : false;
    return a && b || b && c;
}

/**
 *
 * NOTE: This will also return true if the stroke-style is empty and the stroke attribute is invalid!
 * The Same is applicable for the stroke-width.
 * @param svgChild Any child element of an svg
 * @return True if the given Element has an outlining stroke.
 */
function hasOutline(svgChild: HTMLElement): boolean {
    const a: boolean = svgChild.style.stroke ? true : false;
    const b: boolean = svgChild.style.stroke !== 'none';
    const c: boolean = svgChild.getAttribute('stroke') ? true : false;
    const strokeDefined: boolean = a && b || b && c;

    const d: boolean = svgChild.style.strokeWidth ? true : false;
    const e: boolean = svgChild.style.strokeWidth !== '0';
    const f: boolean = svgChild.getAttribute('stroke-width') !== '0';
    const widthDefined: boolean = d && e || e && f;

    return strokeDefined && widthDefined;
}

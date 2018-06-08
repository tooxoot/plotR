import { processPathElement } from './svg.path.processor';
import { processLineElement } from './svg.line.processor';
import { processPolylineElement, processPolygonElement } from './svg.polyline.processor';
import { processEllipseElement, processCircleElement } from './svg.ellipse.processor';
import { processRectangleElement } from './svg.rectangle.processor';
import { XY } from '../data-model/svg.model';
import { Context } from '../data-model/model.context';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { applyTransformations } from './svg.transformation.processor';

export interface ChildResult {
    paths: XY[][];
    closed: boolean[];
}

export function processSVG(svgRoot: HTMLElement): TT.Tree {
    const svgWidth = svgRoot.getAttribute('width');
    const svgHeight = svgRoot.getAttribute('height');
    const context = Context.createNewRoot({X: +(svgWidth) * 100, Y: +(svgHeight) * 100});

    processSVGTree(context, 0, svgRoot);

    return context.pull();
}

function processSVGTree(context: Context, currentGroupId: number, svgSubRoot: HTMLElement) {
    for (let i = 0; i < svgSubRoot.children.length; i++) {
        const currentChild = <HTMLElement> svgSubRoot.children.item(i);

        if (currentChild.tagName === 'g') {
            const groupNode = TT.newGroupNode();
            context.add(currentGroupId, groupNode);
            processSVGTree(context, groupNode.id, currentChild);
        } else {
            const drawableNode = process(currentChild);
            if (!drawableNode) { break; }
            context.add(currentGroupId, drawableNode);
        }
    }
}

function process(svgChild: HTMLElement): TT.DrawableNode {
    const processor: (svhChild: HTMLElement) => ChildResult = {
        'line': processLineElement,
        'polyline': processPolylineElement,
        'polygon': processPolygonElement,
        'rect': processRectangleElement,
        'circle': processCircleElement,
        'eclipse': processEllipseElement,
        'path': processPathElement
    }[svgChild.tagName];

    if (!processor) {
        console.error(`Tag-name ${svgChild.tagName} not supported!`);
        return null;
    }

    let {paths, closed} = processor(svgChild);

    paths = paths
        .map(path => applyTransformations(path, svgChild))
        .map(path => path.map(
            ({X, Y}) => ({ X: X * 100, Y: Y * 100 })
        ));

    return TT.newDrawableNode({
        paths,
        filled: isFilled(svgChild),
        outlined: hasOutline(svgChild),
        closed
    });
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

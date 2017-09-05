// TODO use HTTPELEMENT instead of Element

const STROKE = 'stroke';
const FILL = 'fill';
const NONE = 'none';

export function splitElement(svgChild: HTMLElement): HTMLElement[] {
    const splitResult: HTMLElement[] = [];
    if (hasOutline(svgChild)) {
        const outline: HTMLElement = <HTMLElement>svgChild.cloneNode();

        outline.style.fill = NONE;
        outline.classList.add('OUTLINE');

        splitResult.push(outline);
        console.log(outline)
    }

    if (isFilled(svgChild)) {
        const filling: HTMLElement = <HTMLElement>svgChild.cloneNode();

        filling.style.stroke = NONE;
        filling.classList.add('FILLING');

        splitResult.push(filling);
        console.log(filling)
    }

    return splitResult;
}

/**
 * NOTE: This will also return true if the fill-style is empty and the fill attribute is invalid!
 * @param svgChild Any child element of an svg
 * @return True if the given Element is filled with color.
 */
function isFilled(svgChild: HTMLElement): boolean {
    const a: boolean = svgChild.style.fill ? true : false;
    const b: boolean = svgChild.style.fill !== 'none';
    const c: boolean = svgChild.getAttribute(FILL) !== 'none' ? true : false;
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

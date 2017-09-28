import {splitElement, SplitResult} from './svg.element.splitter'
import {convertElement} from './svg.path.processor'
import {ModelElement} from '../data-model/svg.model'

let elementCount = 0;

export class ElementResult {
    constructor(
        public processedElement: HTMLElement ,
        public values: [number, number][],
        public closed: boolean
    ) {};
}

export class ChildResult {
    constructor(
        public outline: HTMLElement,
        public filling: HTMLElement,
        public modelElement: ModelElement
    ) {};
}

export class InputResult {
    constructor(
        readonly newSVGRoot: HTMLElement,
        readonly modelElements: ModelElement[] = []
    ) {};
}

export function processSVG(svgRoot: HTMLElement): InputResult {
    const inputResult = new InputResult(<HTMLElement>svgRoot.cloneNode(false));
    const processedChildren: HTMLElement[] = [];

    for (let i = 0; i < svgRoot.children.length; i++) {
        console.log('NEXT');
        const childResult = processChild(<HTMLElement>svgRoot.children.item(i));
        processedChildren.push(childResult.outline);
        // processedChildren.push(childResult.filling);
        inputResult.modelElements.push(childResult.modelElement);
    }

    processedChildren.forEach(processedChild => {
        inputResult.newSVGRoot.appendChild(processedChild);
    });

    return inputResult;
}

function processChild(svgChild: HTMLElement): ChildResult {
    let tempResult: ElementResult;
    let splitResult: SplitResult;
    console.log(svgChild);

    switch (svgChild.tagName) {
        case 'path':
            tempResult = convertElement(svgChild);
            console.log(tempResult);
            break;
        default:
            console.error(`Tag-name ${svgChild} not supported!`)
            break;
    }

    splitResult = splitElement(tempResult.processedElement);
    const modelElement = new ModelElement(  tempResult.values,
                                            'ID' + elementCount++,
                                            splitResult.filling == null,
                                            splitResult.outline == null,
                                            tempResult.closed
                                            );

    return new ChildResult(splitResult.outline, splitResult.filling, modelElement);
}

export function extractValues(rawValues: string): number[] {
    const values: number[] = []
    const scanForCoordinates = /[,\t ]*(-{0,1}[\d\.]{1,})/g;

    let currentMatch;
    while (currentMatch = scanForCoordinates.exec(rawValues.trim())) {
        if (currentMatch[0] === '') { break };
        values.push( +(currentMatch[1]) );
    }
    return values
}

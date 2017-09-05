import Bezier = require( 'bezier-js' );
import {splitElement} from './svg.splitter'
import {convertElement} from './svg.path.processor'

export function processSVG(svgRoot: HTMLElement): HTMLElement {
    const processedRoot = <HTMLElement>svgRoot.cloneNode(false);
    let processedChildren: HTMLElement[] = [];

    for (let i = 0; i < svgRoot.children.length; i++) {
        console.log('NEXT')
        processedChildren = processedChildren.concat(processChild(<HTMLElement>svgRoot.children.item(i)));
    }

    processedChildren.forEach(processedChild => {
        processedRoot.appendChild(processedChild);
    });

    return processedRoot;
}

function processChild(svgChild: HTMLElement): HTMLElement[] {
    let tempElement: HTMLElement;
    console.log(svgChild);
    switch (svgChild.tagName) {
        case 'path':
            tempElement = convertElement(svgChild);
            console.log(tempElement);
            break;
        default:
            console.error(`Tag-name ${svgChild} not supported!`)
            tempElement = svgChild;
            break;
    }
    return splitElement(tempElement);
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

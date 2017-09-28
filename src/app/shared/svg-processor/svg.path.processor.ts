import {extractValues, ElementResult} from './svg.input.processor'
import Bezier = require( 'bezier-js' );


class Command {
    constructor(
        public indicator: string,
        public rawValues: string,
        public values: number[]
        ) {};
    toString(): string {
        return `{indicator: ${this.indicator}, rawValues: ${this.rawValues}, values: ${this.values} }`;
    }
}

export function convertElement(oldSvgElement: HTMLElement): ElementResult {
    const dIn = oldSvgElement.getAttribute('d');
    const commands: Command[] = extractCommands(dIn);
    const convertedPoints: [number, number][] = convertCommands(commands);

    return buildNewSvgElement(oldSvgElement, dIn, convertedPoints);
}

function extractCommands(dIn: string): Command[] {
    const scanForCommands = /([MmLlHhVvCcSsQqTt])([-\d,.\t ]*)/g;
    const commands: Command[] = [];

    let currentMatch;
    while (currentMatch = scanForCommands.exec(dIn)) {
        commands.push(new Command(  currentMatch[1],
                                    currentMatch[2],
                                    extractValues(currentMatch[2])));
    }

    return commands;
}

function convertCommands(commands: Command[]): [number, number][] {
    let points: [number, number][] = [];
    let last = -1;
    let xyPair: number[];
    commands.forEach(command => {
        switch (command.indicator) {
            case 'M': case 'L':
                while ( command.values.length > 0 ) {
                    points.push( [command.values.shift(), command.values.shift()] );
                    last++;
                }
                break;
            case 'l':
                while ( command.values.length > 0 ) {
                    xyPair = [command.values.shift(), command.values.shift()]
                    points.push( [points[last][0] + xyPair[0], points[last][1] + xyPair[1]] );
                    last++;
                }
                break;
            case 'H':
                while ( command.values.length > 0 ) {
                    points.push( [command.values.shift(), points[last][1]] );
                    last++;
                }
                break;
            case 'h':
                while ( command.values.length > 0 ) {
                    points.push( [points[last][0] + command.values.shift(), points[last][1]] );
                    last++;
                }
                break;
            case 'V':
                while ( command.values.length > 0 ) {
                    points.push( [points[last][1], command.values.shift()] );
                    last++;
                }
                break;
            case 'v':
                while ( command.values.length > 0 ) {
                    points.push( [points[last][0], points[last][1] + command.values.shift()] );
                    last++;
                }
                break;
            case 'Q': case 'q': case 'C': case 'c': case 'T': case 't': case 'S': case 's':
                const controlPoints = convertBezierValues(
                                                            command.indicator,
                                                            command.values,
                                                            {x: points[last][0], y: points[last][1]}
                                                            );
                points = points.concat(convertBezierCurves(command.indicator, controlPoints));
                break;
            default:
                console.error(`Command ${command.indicator} not specified!`)
                break;
        }
    });


    return points;
}

function convertBezierValues(indicator: string, values: number[], lastPoint: {x: number, y: number}): {x: number, y: number}[] {
    const convertedPoints: {x: number, y: number}[] = [ lastPoint, lastPoint ];
    let currentPoint: {x: number, y: number};

    let reflectionindicator = 0;
    while ( values.length > 0 ) {

        // Reflect last Anchor for the smooth curve commands
        if ( ['S', 's', 'T', 't'].includes(indicator) && ( ['T', 't'].includes(indicator) || reflectionindicator % 2 === 0 ) ) {
            const reflectedAnchorX = convertedPoints[convertedPoints.length - 2].x;
            const reflectedAnchorY = convertedPoints[convertedPoints.length - 2].y;
            const fixPointX        = convertedPoints[convertedPoints.length - 1].x;
            const fixPointY        = convertedPoints[convertedPoints.length - 1].y;
            const reflectionResult = { x: 2 * fixPointX - reflectedAnchorX, y: 2 * fixPointY - reflectedAnchorY }
            convertedPoints.push( reflectionResult );
        }
        reflectionindicator++;

        currentPoint = {x: values.shift(), y: values.shift()};

        // Calculate absolute values from relative commands
        if ( ['q', 'c', 's', 't'].includes(indicator) ) {
            currentPoint.x += convertedPoints[convertedPoints.length - 1].x;
            currentPoint.y += convertedPoints[convertedPoints.length - 1].y;
        }

        convertedPoints.push(currentPoint);

    }
    // Removes the point added for reflection
    convertedPoints.shift();
    return convertedPoints;
}

function convertBezierCurves(indicator: string, controlPoints: {x: number, y: number}[]): [number, number][] {
    const points: [number, number][] = [];

    let controlPointNumber = 3;
    // For cubic curves there is one more control-point
    if ( ['C', 'c', 'S', 's'].includes(indicator) ) { controlPointNumber = 4 };

    // Convert the svg curves defined by the controlPoints array into polylines
    while ( controlPoints.length > 1 ) {
        const curve = new Bezier(controlPoints.slice(0, controlPointNumber));
        controlPoints.splice(0, controlPointNumber - 1);
        const lookUpTable = curve.getLUT(curve.length() / 10);

        lookUpTable.forEach(step => {
            points.push([step.x, step.y]);
        });
    }

    points.push([controlPoints[0].x, controlPoints[0].y]);
    return points;
}

function buildNewSvgElement(oldSvgElement: HTMLElement, dIn: String, convertedPoints: [number, number][]): ElementResult {
    const newSvgElement = <HTMLElement>oldSvgElement.cloneNode();
    const processingResult = new ElementResult(null, convertedPoints, false);

    let dOut = `M ${convertedPoints[0][0].toFixed(2)} ${convertedPoints[0][1].toFixed(2)} L`;
    convertedPoints.splice(0, 1);

    convertedPoints.forEach( point => {
        dOut += ` ${point[0].toFixed(2)} ${point[1].toFixed(2)}`;
    });

    if (dIn.includes('z') || dIn.includes('Z')) {
        dOut += ' Z';
        processingResult.closed = true;
    } else {
        processingResult.closed = false;
    }

    newSvgElement.setAttribute('d', dOut);
    processingResult.processedElement = newSvgElement;
    // TODO delete debugin Attributes
    // newSvgElement.setAttribute("style", "")
    // newSvgElement.setAttribute('stroke', 'none')
    // newSvgElement.setAttribute('fill', 'green')
    // newSvgElement.setAttribute('id', 'green')

    return processingResult;
}

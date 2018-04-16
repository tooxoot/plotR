import { extractValues, ChildResult } from './svg.input.processor';
const Bezier = require('bezier-js') as typeof BezierJs.Bezier;

class Command {
    constructor(
        public indicator: string,
        public rawValues: string,
        public values: number[]
        ) {}
    toString(): string {
        return `{indicator: ${this.indicator}, rawValues: ${this.rawValues}, values: ${this.values} }`;
    }
}

export function processPathElement(oldSvgElement: HTMLElement): ChildResult {
    const dIn = oldSvgElement.getAttribute('d');
    const commands: Command[] = extractCommands(dIn);
    const convertedPoints: [number, number][] = convertCommands(commands);

    return buildChildResult(oldSvgElement, dIn, convertedPoints);
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

let lP: [number, number] = [0, 0];

function convertCommands(commands: Command[]): [number, number][] {
    let points: [number, number][] = [];
    let last = -1;
    let xyPair: number[];
    let vals: number[];
    // console.log(JSON.stringify('---'));        
    commands.forEach(command => {
        vals = [...command.values];
        // console.log(JSON.stringify(command.values));        
        switch (command.indicator) {
            case 'M': case 'L':
                while ( command.values.length > 0 ) {
                    points.push( [command.values.shift(), command.values.shift()] );
                    last++;
                }
                break;
            case 'm': case 'l':
                if (points.length === 0) {
                    xyPair = [command.values.shift(), command.values.shift()];
                    points.push( [lP[0] * 0 + xyPair[0], lP[1] * 0 + xyPair[1]] );
                    last++;
                    console.log('>> xy', xyPair, '>>P', points[last]);
                }
                while ( command.values.length > 0 ) {
                    xyPair = [command.values.shift(), command.values.shift()];
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
                    points.push( [points[last][0], command.values.shift()] );
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
                const bezierPoints = convertBezierCurves(command.indicator, controlPoints);
                last += bezierPoints.length;
                points = points.concat(bezierPoints);
                break;
            default:
                console.error(`Command ${command.indicator} not specified!`);
                break;
        }
    });
    lP = [vals[vals.length - 2], vals[vals.length - 1]];
    return points;
}

function convertBezierValues(
    indicator: string,
    values: number[],
    lastPoint: {x: number, y: number}
): {x: number, y: number}[] {
    const convertedPoints: {x: number, y: number}[] = [ lastPoint, lastPoint ];
    let currentPoint: {x: number, y: number};
    console.log('val', lastPoint, values);
    let reflectionindicator = 0;
    let lastAnchor = lastPoint;
    while ( values.length > 0 ) {

        // Reflect last Anchor for the smooth curve commands
        if ( ['S', 's', 'T', 't'].indexOf(indicator) >= 0
             && ( ['T', 't'].indexOf(indicator) >= 0
             || reflectionindicator % 2 === 0 ) ) {
            const reflectedAnchorX = convertedPoints[convertedPoints.length - 2].x;
            const reflectedAnchorY = convertedPoints[convertedPoints.length - 2].y;
            const fixPointX        = convertedPoints[convertedPoints.length - 1].x;
            const fixPointY        = convertedPoints[convertedPoints.length - 1].y;
            const reflectionResult = { x: 2 * fixPointX - reflectedAnchorX, y: 2 * fixPointY - reflectedAnchorY };
            convertedPoints.push( reflectionResult );
        }
        reflectionindicator++;
        
        currentPoint = {x: values.shift(), y: values.shift()};

        // Calculate absolute values from relative commands
        if ( ['q', 'c', 's', 't'].indexOf(indicator) >= 0 ) {
            currentPoint.x += lastAnchor.x;
            currentPoint.y += lastAnchor.y;
        }

        convertedPoints.push(currentPoint);
        // fuck little letters!
        if (reflectionindicator % 3 === 0) { lastAnchor = convertedPoints[convertedPoints.length - 1]; }
    }
    // Removes the point added for reflection
    convertedPoints.shift();
    console.log('conv', [...convertedPoints]);        
    // console.log('val', lastPoint, values);
    
    return convertedPoints;
}

function convertBezierCurves(indicator: string, controlPoints: {x: number, y: number}[]): [number, number][] {
    const points: [number, number][] = [];
    // console.log('next', controlPoints.map(e => [e.x, e.y]));
    let controlPointNumber = 3;
    // For cubic curves there is one more control-point
    if ( ['C', 'c', 'S', 's'].indexOf(indicator) >= 0 ) { controlPointNumber = 4; }

    // Convert the svg curves defined by the controlPoints array into polylines
    while ( controlPoints.length > 1 ) {
        const curve = new Bezier(controlPoints.slice(0, controlPointNumber));
        controlPoints.splice(0, controlPointNumber - 1);
        const lookUpTable = curve.getLUT(curve.length() / 1);

        lookUpTable.forEach(step => {
            points.push([step.x, step.y]);
        });
        // console.log(controlPoints.map(e => [e.x, e.y]));
        
    }
    // console.log('end', controlPoints.map(e => [e.x, e.y]), points);
    
    points.push([controlPoints[0].x, controlPoints[0].y]);
    return points;
}

function buildChildResult(oldSvgElement: HTMLElement, dIn: String, convertedPoints: [number, number][]): ChildResult {
    const processingResult: ChildResult =   {   points: convertedPoints.map(point => ({X: point[0], Y: point[1]}) ),
                                                closed: dIn.includes('z') || dIn.includes('Z')
                                            };

    return processingResult;
}

import { extractValues, ChildResult } from './svg.input.processor';
import { XY } from '../data-model/svg.model';

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

interface ConvertedCommand {
    indicator: string;
    commandPoints: XY[];
    points: XY[];
}

export function processPathElement(oldSvgElement: HTMLElement): ChildResult {
    const dIn = oldSvgElement.getAttribute('d');
    const commands: Command[] = extractCommands(dIn);
    const convertedPoints: XY[] = convertCommands(commands);

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

function convertCommands(commands: Command[]): XY[] {
    let point: XY;
    let convertedCommands: ConvertedCommand[] = [];
    let lastCommandPoint: XY;

    commands.forEach(({indicator, values}) => {
        const commandPoints: XY[] = [];
        let points: XY[] = [];

        const push = (...cps: XY[]) => {
            cps.forEach(commandPoint => {
                commandPoints.push(commandPoint);
                lastCommandPoint = commandPoint;
            });
        };

        switch (indicator) {
            case 'M': case 'L':
                while ( values.length > 0 ) {
                    push({X: values.shift(), Y: values.shift()});
                }
                break;
            case 'm': case 'l':
                if (convertedCommands.length === 0) {
                    push({X: values.shift(), Y: values.shift()});
                }

                while ( values.length > 0 ) {
                    point = {X: values.shift(), Y: values.shift()};
                    point.X += lastCommandPoint.X;
                    point.Y += lastCommandPoint.Y;
                    push(point);
                }
                break;
            case 'H':
                while ( values.length > 0 ) {
                    push({X: values.shift(), Y: lastCommandPoint.Y});
                }
                break;
            case 'h':
                while ( values.length > 0 ) {
                    point = {...lastCommandPoint};
                    point.X += values.shift();
                    push(point);
                }
                break;
            case 'V':
                while ( values.length > 0 ) {
                    push({X: lastCommandPoint.X , Y: values.shift()});
                }
                break;
            case 'v':
                while ( values.length > 0 ) {
                    point = {...lastCommandPoint};
                    point.Y += values.shift();
                    push(point);
                }
                break;
            case 'Q': case 'q': case 'C': case 'c': case 'T': case 't': case 'S': case 's':
                const controlPoints = convertBezierValues(
                    indicator,
                    values,
                    convertedCommands,
                );
                push(...controlPoints);
                const bezierPoints = convertBezierCurves(indicator, [...controlPoints]);
                points.push(...bezierPoints);
                break;
            default:
                console.error(`Command ${indicator} not specified!`);
                break;
        }

        if (!['C', 'c', 'S', 's', 'Q', 'q', 'T', 't'].includes(indicator)) {
            points = commandPoints;
        }
        convertedCommands.push({indicator, commandPoints, points});
    });

    return convertedCommands.reduce(
        (points, cc) => {
            points.push(...cc.points);
            return points;
        },
        [] as XY[]
    );
}

function convertBezierValues(
    indicator: string,
    values: number[],
    convertedCommands: ConvertedCommand[],
): XY[] {
    const lastCommand = convertedCommands.slice(-1)[0];
    const secondlastCommand = convertedCommands.slice(-2)[0];

    const lastIndicator = lastCommand.indicator;

    const lastCP = lastCommand.commandPoints.slice(-1)[0];
    let secondLastCP = lastCommand.commandPoints.slice(-2)[0];

    if (!secondLastCP && secondlastCommand) {
        secondLastCP = secondlastCommand.commandPoints.slice(-1)[0];
    }
    if (!secondLastCP) {
        secondLastCP = lastCP;
    }

    const convertedPoints: XY[] = [ {...secondLastCP}, {...lastCP} ];
    let currentPoint: XY;
    let idx = 0;
    let lastRelative = lastCP;

    const reflect = (fix: XY, reflected: XY) => ({
        X: 2 * fix.X - reflected.X,
        Y: 2 * fix.Y - reflected.Y,
    });

    const isRelativ = ['q', 'c', 's', 't'].includes(indicator);
    const isS = ['S', 's'].includes(indicator);
    const isT = ['T', 't'].includes(indicator);
    const previousIsNotQorT = !['Q', 'q', 'T', 't'].includes(lastIndicator);
    const previousIsNotCorS = !['C', 'c', 'S', 's'].includes(lastIndicator);

    while ( values.length > 0 ) {

        // Reflect last Anchor for the smooth curve commands
        if (
            isT && idx === 0 && previousIsNotQorT
            || isS && idx === 0 && previousIsNotCorS
        ) {
            convertedPoints.push( {...convertedPoints[1]} );
        } else if (
            isT
            || isS && idx % 2 === 0
        ) {
            convertedPoints.push( reflect(convertedPoints.slice(-1)[0], convertedPoints.slice(-2)[0]) );
        }

        idx++;

        currentPoint = {X: values.shift(), Y: values.shift()};

        // Calculate absolute values from relative commands
        if (isRelativ) {
            currentPoint.X += lastRelative.X;
            currentPoint.Y += lastRelative.Y;
        }

        convertedPoints.push(currentPoint);

        if (
            indicator === 'c' && idx % 3 === 0
            || indicator === 's' && idx % 2 === 0
            || indicator === 'q' && idx % 2 === 0
            || indicator === 't' && idx % 1 === 0
        ) {
            lastRelative = convertedPoints.slice(-1)[0];
        }
    }
    // Removes the point added for reflection
    convertedPoints.shift();
    return convertedPoints;
}

function convertBezierCurves(indicator: string, controlPoints: XY[]): XY[] {
    const points: XY[] = [];
    let controlPointNumber = 3;

    if ( ['C', 'c', 'S', 's'].includes(indicator)) { controlPointNumber = 4; }

    // Convert the svg curves defined by the controlPoints array into polylines
    while ( controlPoints.length > 1 ) {
        const curve = new Bezier(controlPoints.slice(0, controlPointNumber).map(p => ({x: p.X, y: p.Y})));
        controlPoints.splice(0, controlPointNumber - 1);
        const lookUpTable = curve.getLUT(curve.length() / 1);

        lookUpTable.forEach(step => {
            points.push({X: step.x, Y: step.y});
        });
    }

    points.push({...controlPoints[0]});
    return points;
}

function buildChildResult(oldSvgElement: HTMLElement, dIn: String, points: XY[]): ChildResult {
    const processingResult: ChildResult =   {   points,
                                                closed: dIn.includes('z') || dIn.includes('Z')
                                            };

    return processingResult;
}

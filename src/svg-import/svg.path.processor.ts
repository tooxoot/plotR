import { extractValues, ChildResult } from './svg.input.processor';
import { XY } from '../data-model/svg.model';
import { MathUtils as MU }  from '../utils/math.utils';

const Bezier = require('bezier-js') as typeof BezierJs.Bezier;

interface Command {
    indicator: string;
    values: number[];
}

export function processPathElement(oldSvgElement: HTMLElement): ChildResult {
    const dString = oldSvgElement.getAttribute('d');
    const commands: Command[] = extractCommandsFrom(dString);
    // console.log('commands', commands);
    const simplifiedCommands = simplify(commands);
    // console.log('simplifiedCommands', simplifiedCommands);
    const pathPoints = calculatePointsFor(simplifiedCommands);

    return {
        points: pathPoints,
        closed: dString.includes('z') || dString.includes('Z')
    };
}

function extractCommandsFrom(dIn: string): Command[] {
    const scanForCommands = /([AaMmLlHhVvCcSsQqTt])([-\d,.\t ]*)/g;
    const commands: Command[] = [];

    let currentMatch;
    while (currentMatch = scanForCommands.exec(dIn)) {
        commands.push({
            indicator: currentMatch[1],
            values: extractValues(currentMatch[2]),
        });
    }

    return commands;
}

type CommandType = 'line' | 'arc' | 'cubic' | 'cubic_reflected' | 'quadratic' | 'quadratic_reflected';

interface SimplifiedComamnd {
    type: CommandType;
    points: XY[];
}

function simplify(commands: Command[]): SimplifiedComamnd[] {
    let simplifiedCommands: SimplifiedComamnd[] = [];

    let lastSimplified: SimplifiedComamnd;

    let currentType: CommandType;
    let commandLength: number;

    // helperfunctions which map valuetouples to XY
    let last: XY;
    const assignLastXY = (p: XY) => {
        last = {...p};
        // console.log([last.X, last.Y]);
        return p;
    };

    const asAbsolute = ([X, Y]: number[]) => assignLastXY({X, Y});
    const asRelative =  ([X, Y]: number[], idx: number) => (idx + 1) % commandLength === 0 ?
        assignLastXY({X: last.X + X, Y: last.Y + Y}) :
        ({X: last.X + X, Y: last.Y + Y});
    const asHorizontalAbsolute = ([X]: number[]) => asAbsolute([X, last.Y]);
    const asVerticalAbsolute = ([Y]: number[]) => asAbsolute([last.X, Y]);
    const asHorizontalRelative = ([X]: number[], idx: number) => asRelative([X, 0], idx);
    const asVerticalRelative = ([Y]: number[], idx: number) => asRelative([0, Y], idx);
    const asRelativeArc = ([X, Y]: number[], idx: number) => (idx + 1) % commandLength === 0 ?
        assignLastXY({X: last.X + X, Y: last.Y + Y}) :
        ({X, Y});

    const toTouplesOf = <T>(size: number) =>
        (touples: T[][] , val: T, idx: number, vals: T[]) => {
            if (idx % size !== 0) { return touples; }
            touples.push(vals.slice(idx, idx + size));
            return touples;
        };

    const ifArcAdd0 = () => currentType !== 'arc' ?
        (touples: number[][], touple: number[]) => { touples.push(touple); return touples; } :
        (touples: number[][], [rx, ry, angle, large, sweep, X, Y]: number[]) => touples.concat([
            [rx, ry],
            [angle, 0],
            [large, sweep],
            [X, Y]
        ]);

    const addReflectedPointTo = (touple: XY[]) => {
        const lastPoints = lastSimplified.points.slice(-2);
        const reflectedPoint = !currentType.includes(lastSimplified.type) ?
            lastPoints.pop() :
            {
                X: 2 * lastPoints[1].X - lastPoints[0].X,
                Y: 2 * lastPoints[1].Y - lastPoints[0].Y,
            };

        return [].concat(reflectedPoint, touple);
    };

    const pushSimplifiedCommand = (touple: XY[]) => {
        const type = currentType;
        const points = type.includes('reflected') ? addReflectedPointTo(touple) : touple;

        if (type !== 'line') { points.unshift(lastSimplified.points.slice(-1)[0]); }

        const simplifiedCommand = { type, points };

        lastSimplified = simplifiedCommand;
        simplifiedCommands.push(simplifiedCommand);
    };

    commands.forEach(({indicator, values}, notFirstCommand) => {
        if (values.length === 0) { return; }

        currentType =
            'M m L l V v H h '.includes(indicator) ? 'line' :
            'C c'.includes(indicator) ? 'cubic' :
            'S s'.includes(indicator) ? 'cubic_reflected' :
            'Q q'.includes(indicator) ? 'quadratic' :
            'T t'.includes(indicator) ? 'quadratic_reflected' :
            'arc';
        // console.log(currentType);
        commandLength =
            'M m L l V v H h T t'.includes(indicator) ? 1 :
            'S s Q q'.includes(indicator) ? 2 :
            'C c'.includes(indicator) ? 3 :
            4;

        const parameterLength =
            'V H v h'.includes(indicator) ? 1 :
            'A a'.includes(indicator) ? 7 :
            2;

        const toAsoluteXY: (touple: number[], idx: number) => XY =
            Object.entries({
                'M L C S Q T A': asAbsolute,
                'l c s q t': asRelative,
                'm': ([X, Y]: number[], idx: number) => notFirstCommand || idx > 0 ?
                    asRelative([X, Y], idx) :
                    asAbsolute([X, Y]),
                'V': asVerticalAbsolute,
                'H': asHorizontalAbsolute,
                'v': asVerticalRelative,
                'h': asHorizontalRelative,
                'a': asRelativeArc
            }).find(([key]) => key.includes(indicator))[1] ;

        // console.log(ifArcAdd0());

        const  a = values
            .reduce(toTouplesOf(parameterLength), [])
            .reduce(ifArcAdd0(), []);
        // console.log('>>>a', a);
        a
            .map(toAsoluteXY)
            .reduce(toTouplesOf(commandLength), [])
            .forEach(pushSimplifiedCommand);
    });

    return simplifiedCommands;
}

function calculatePointsFor(simplifiedCommands: SimplifiedComamnd[]): XY[] {
    const extractFromCommandOf = (type: CommandType) =>
        'line'.includes(type) ? (points: XY[]) => points :
        'cubic cubic_reflected quadratic quadratic_reflected'.includes(type) ? calculateBezierCurvePointsFor :
        calculateArcPointsFor;

    const toPathPoints = (extractedPoints: XY[], {type, points}: SimplifiedComamnd) =>
        extractedPoints.concat(...extractFromCommandOf(type)(points));

    return simplifiedCommands.reduce(toPathPoints, []);
}

function calculateArcPointsFor([previousXY, radii, rotation, flags, endXY]: XY[]): XY[] {
    const {X: x1, Y: y1} = previousXY;
    const {X: x2, Y: y2} = endXY;
    let {X: rX, Y: rY} = radii;

    const phi = rotation.X;
    const largeFlag = Boolean(flags.X);
    const sweepFlag = Boolean(flags.Y);

    const [xI, yI] = MU.transform([
         MU.cos(phi), MU.sin(phi), 0,
        -MU.sin(phi), MU.cos(phi), 0
    ])([
        (x1 - x2) / 2,
        (y1 - y2) / 2
    ]);

    const radiiCorrection = xI ** 2 / rX ** 2 + yI ** 2 / rY ** 2;
    if (radiiCorrection > 1) {
        rX = radiiCorrection ** 0.5 * rX;
        rY = radiiCorrection ** 0.5 * rY;
    }

    const sign = largeFlag === sweepFlag ? -1 : 1;

    const root = (
        (rX ** 2 * rY ** 2 - rX ** 2 * yI ** 2 - rY ** 2 * xI ** 2) /
        (rX ** 2 * yI ** 2 + rY ** 2 * xI ** 2)
    ) ** 0.5;

    const [cIX, cIY] = [
        sign * root * (rX * yI / rY),
        sign * root * -(rY * xI / rX),
    ];

    const [cX, cY] = MU.concat(
        MU.transform([
            MU.cos(phi), -MU.sin(phi), 0,
            MU.sin(phi),  MU.cos(phi), 0
        ]),
        MU.translate([
            (x1 + x2) / 2,
            (y1 + y2) / 2,
        ])
    )([
        cIX,
        cIY
    ]);

    const vec1 = [
        (xI - cIX) / rX,
        (yI - cIY) / rY
    ];
    const vec2 = [
        (-xI - cIX) / rX,
        (-yI - cIY) / rY
    ];

    let theta = MU.angleTo([1, 0])(vec1);
    let dTheta = MU.angleTo(vec1)(vec2) % 360;

    if (!sweepFlag &&  dTheta > 0) { dTheta -= 360; }
    if (sweepFlag &&  dTheta < 0) { dTheta += 360; }

    return MU.calculateEllipsePoints(cX, cY, rX, rY, theta, dTheta, phi).map(MU.toXY);
}

function calculateBezierCurvePointsFor(controlPoints: XY[]): XY[] {
    const curve = new Bezier(controlPoints.map(({X, Y}) => ({x: X, y: Y})));
    const curvePoints = curve.getLUT(curve.length() / 1);

    return curvePoints
        .map(({x, y}) => ({X: x, Y: y}))
        .slice(1);
}

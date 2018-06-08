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
    const simplifiedCommands = simplify(commands);
    const pathPoints = calculatePointsFor(simplifiedCommands);

    return pathPoints;
}

function extractCommandsFrom(dIn: string): Command[] {
    const scanForCommands = /([AaMmLlHhVvCcSsQqTtZz])([-+\d,.\t ]*)/g;
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

type CommandType =
    'move' | 'close' | 'line' | 'arc' | 'cubic' | 'cubic_reflected' | 'quadratic' | 'quadratic_reflected';

interface SimplifiedComamnd {
    type: CommandType;
    points: XY[];
}

function simplify(commands: Command[]): SimplifiedComamnd[] {
    let simplifiedCommands: SimplifiedComamnd[] = [];

    let lastSimplified: SimplifiedComamnd;

    let currentType: CommandType;
    let commandLength: number;

    let last: XY;
    let currentStart: XY;

    const assignLastXY = (p: XY) => {
        last = {...p};
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
        let type = currentType;
        const points = type.includes('reflected') ? addReflectedPointTo(touple) : touple;

        if (type === 'move') {
            simplifiedCommands.push({ type: 'move', points: [] });
            type = 'line';
        } else if (type !== 'line') {
            points.unshift(lastSimplified.points.slice(-1)[0]);
        }

        const simplifiedCommand = { type, points };

        lastSimplified = simplifiedCommand;
        simplifiedCommands.push(simplifiedCommand);
    };

    commands.forEach(({indicator, values}, notFirstCommand) => {
        if ('Z z'.includes(indicator)) {
            simplifiedCommands.push({type: 'close', points: []});
            last = currentStart;
        }
        if (values.length === 0) { return; }

        currentType = Object.entries({
            'M m': 'move',
            'L l V v H h ': 'line',
            'C c': 'cubic',
            'S s': 'cubic_reflected',
            'Q q': 'quadratic',
            'T t': 'quadratic_reflected',
            'A a': 'arc',
        }).find(([key]) => key.includes(indicator))[1] as CommandType;

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
                'M': ([X, Y]: number[], idx: number) => {
                    if (idx === 0) { currentStart = {X, Y}; }
                    return asAbsolute([X, Y]);
                },
                'L C S Q T A': asAbsolute,
                'l c s q t': asRelative,
                'm': ([X, Y]: number[], idx: number) => {
                    const p = notFirstCommand || idx > 0 ?
                        asRelative([X, Y], idx) :
                        asAbsolute([X, Y]);
                    if (idx === 0) { currentStart = p; }
                    return p;
                },
                'V': asVerticalAbsolute,
                'H': asHorizontalAbsolute,
                'v': asVerticalRelative,
                'h': asHorizontalRelative,
                'a': asRelativeArc
            }).find(([key]) => key.includes(indicator))[1] ;
        values
            .reduce(toTouplesOf(parameterLength), [])
            .reduce(ifArcAdd0(), [])
            .map(toAsoluteXY)
            .reduce(toTouplesOf(commandLength), [])
            .forEach(pushSimplifiedCommand);
    });

    return simplifiedCommands;
}

function calculatePointsFor(simplifiedCommands: SimplifiedComamnd[]): {paths: XY[][], closed: boolean[]} {
    const closed: boolean[] = simplifiedCommands
        .filter(({type}) => 'move close'.includes(type))
        .reduce(
            (result, {type}, idx, commands) => type === 'move' ?
                result.concat(Boolean(commands[idx + 1]) && commands[idx + 1].type === 'close') :
                result,
            []
        );

    const extractFromCommandOf = (type: CommandType) => Object.entries({
        'line close': (points: XY[]) => points,
        'cubic cubic_reflected quadratic quadratic_reflected': calculateBezierCurvePointsFor,
        'arc': calculateArcPointsFor,
    }).find(([key]) => key.includes(type))[1];

    const toPathPoints = (extractedPoints: XY[][], {type, points}: SimplifiedComamnd) => {
        if (type === 'move') { return [...extractedPoints, []]; }
        extractedPoints.slice(-1)[0].push(...extractFromCommandOf(type)(points));
        return extractedPoints;
    };

    return {
        paths: simplifiedCommands.reduce(toPathPoints, []),
        closed

    };
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

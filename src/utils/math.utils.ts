import { XY } from '../data-model/svg.model';

export module MathUtils {
    export const toXY = ([X, Y]: number[]) => ({X, Y});
    export const toVec = ({X, Y}: XY) => [X, Y];

    export const toRadians = (degrees: number) => (Math.PI / 180) * degrees;
    export const toDegrees = (radians: number) => (180 / Math.PI) * radians;

    export const sin = (degrees: number) => Math.sin(toRadians(degrees));

    export const cos = (degrees: number) => Math.cos(toRadians(degrees));

    export const arccos = (ratio: number) => toDegrees(Math.acos(ratio));

    export const dotProduct = (u: number[]) =>
        (v: number[]) => u.reduce((product, ui, idx) => product + ui * v[idx], 0);

    export const norm = (u: number[]) => dotProduct(u)(u) ** 0.5;

    export const determinant = (u: number[]): number => {
        const [a, b, c, d, e, f, g, h, i] = u;
        if (u.length === 4) { return a * d - b * c; }
        if (u.length === 9) {
            return a * determinant([
                e, f,
                h, i
            ]) - b * determinant([
                d, f,
                g, i
            ]) + c * determinant([
                d, e,
                g, h
            ]);
        }

        console.error('Dimensions of matrix are not supported: ' + u.length);
        return NaN;
    };

    export const matrix = (...vectors: number[][]) =>
        vectors[0].reduce(
            (mat, _, idx) => mat.concat(...vectors.map(v => v[idx])),
            []
        );

    export const angleTo = (u: number[]) =>
        (v: number[]) => Math.sign(determinant(matrix(u, v))) * arccos(dotProduct(u)(v) / (norm(u) * norm(v)));

    export const tan = (degrees: number) => Math.tan(toRadians(degrees));

    export const boxContains = (corner1: number[], corner2: number[]) => (p: number[]) =>
        ((p[0] >= corner1[0] && p[0] <= corner2[0]) || (p[0] <= corner1[0] && p[0] >= corner2[0])) &&
        ((p[1] >= corner1[1] && p[1] <= corner2[1]) || (p[1] <= corner1[1] && p[1] >= corner2[1]));

    export const concat = <T>(...functions: ((t: T) => T)[]) =>  (t: T) => functions.reduce((x, f) => f(x), t);

    // tslint:disable:no-any
    export const pipe =
        <T, U>(...functions: ((t: any) => any)[]) =>  (t: T) => functions.reduce((x, f) => f(x), t) as U;
    // tslint:enable:no-any

    export const withXYArgs = (f: (vec: number[]) => number[]) => pipe<XY, XY>(toVec, f, toXY);

    export const transform = (mat: number[]) => mat.length === 4 ?
        ([X, Y]: number[]) =>  ([
            (X * mat[0]) + (Y * mat[1]),
            (X * mat[2]) + (Y * mat[3]),
        ]) :
        ([X, Y]: number[]) =>  ([
            (X * mat[0]) + (Y * mat[1]) + mat[2],
            (X * mat[3]) + (Y * mat[4]) + mat[5],
        ]);

    export const translate = ([tx, ty]: number[]) => transform([
        1, 0, tx,
        0, 1, ty,
    ]);

    export const scale = ([sx, sy]: number[]) => transform([
        sx,  0,
        0 , sy,
    ]);

    export const rotate = ([angle, cx, cy]: number[]) => concat(
        translate([-cx, -cy]),
        transform([
            cos(angle), -sin(angle),
            sin(angle),  cos(angle),
        ]),
        translate([cx, cy])
    );

    export const skewX = ([angle]: number[]) => transform([
        1, tan(angle),
        0,          1,
    ]);

    export const skewY = ([angle]: number[]) => transform([
                 1, 0,
        tan(angle), 1,
    ]);

    export function calculateEllipsePoints(
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        theta: number = 0,
        dTheta: number = 360,
        phi: number = 0,
        step: number = 1
    ): number[][] {
        const sign = Math.sign(dTheta);
        const maxDelta = Math.abs(dTheta);
        const deltas: number[] = [];
        let currentDelta = 0;

        do {
            deltas.push(currentDelta);
        } while ((currentDelta += step) <  maxDelta);

        if (deltas.slice(-1)[0] !== maxDelta)  { deltas.push(maxDelta); }

        return deltas
            .map(delta => theta + sign * delta)
            .map(angle => concat(
                    transform([
                        cos(phi), -sin(phi),
                        sin(phi),  cos(phi),
                    ]),
                    translate([
                        cx,
                        cy
                    ])
                )([
                    rx * cos(angle),
                    ry * sin(angle),
                ])
            );
    }
}

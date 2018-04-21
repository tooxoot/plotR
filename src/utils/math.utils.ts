import { XY } from '../data-model/svg.model';

export module MathUtils {

    export const toRadians = (degrees: number) => (Math.PI / 180) * degrees;

    export const sin = (degrees: number) => Math.sin(toRadians(degrees));

    export const cos = (degrees: number) => Math.cos(toRadians(degrees));

    export const tan = (degrees: number) => Math.tan(toRadians(degrees));

    export const concat = (...functions: ((p: XY) => XY)[]) => (p: XY) => functions.reduce((x, f) => f(x), p);

    export const transform = ([a, b, c, d, e, f]: number[]) => (p: XY) => applyMatrix(
        p,
        [
            a, b, c,
            d, e, f,
            0, 0, 1
        ]
    );

    export const translate = ([tx, ty]: number[]) => transform([
        1, 0, tx,
        0, 1, ty,
    ]);

    export const scale = ([sx, sy]: number[]) => transform([
        sx, 0 ,  0,
        0 , sy,  0,
    ]);

    export const rotate = ([angle, cx, cy]: number[]) => concat(
        translate([-cx, -cy]),
        transform([
            cos(angle), -sin(angle), 0,
            sin(angle),  cos(angle), 0,
        ]),
        translate([cx, cy])
    );

    export const skewX = ([angle]: number[]) => transform([
        1, tan(angle),   0,
        0, 1         ,   0,
    ]);

    export const skewY = ([angle]: number[]) => transform([
        1, tan(angle),   0,
        0, 1         ,   0,
    ]);

    export function applyTranslation(point: XY, tx: number, ty: number): XY {
        const matrix = [
            1 ,        0 ,       tx,
            0 ,        1 ,       ty,
            0 ,        0 ,        1
        ];
        return applyMatrix(point, matrix);
    }

    export function applyMatrix(point: XY, matrix: number[]): XY {
        const c0r0 = matrix[0], c1r0 = matrix[1], c2r0 = matrix[2];
        const c0r1 = matrix[3], c1r1 = matrix[4], c2r1 = matrix[5];

        const x = point.X;
        const y = point.Y;
        const z = 1;

        const resultX = (x * c0r0) + (y * c1r0) + (z * c2r0);
        const resultY = (x * c0r1) + (y * c1r1) + (z * c2r1);
        return {X: resultX, Y: resultY};
    }
}

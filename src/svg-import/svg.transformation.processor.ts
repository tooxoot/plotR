import { XY } from '../data-model/svg.model';
import { extractValues } from './svg.input.processor';

interface Transformation {
    command: string;
    values: number[];
}

export function transform(points: XY[], svgChild: HTMLElement): XY[] {
    let newPoints: XY[] = points;
    const tString = svgChild.getAttribute('transform').trim();
    const tRegex = /(matrix|translate|scale|rotate|skewX|skewY)\((.+?)\)/g;
    const transformations: Transformation[] = [];

    let currentMatch;
    while (currentMatch = tRegex.exec(tString)) {
        transformations.push({
            command: currentMatch[1],
            values: extractValues(currentMatch[2])
        });
    }

    transformations.reverse().forEach(transformation => {
        newPoints = applyTransformation(newPoints, transformation);
    });
    return newPoints;
}

function applyTransformation(points: XY[], transformation: Transformation): XY[] {
    const values = transformation.values;
    let newPoints: XY[];
    let matrix: number[];
    let radians: number;

    switch (transformation.command) {
        case 'matrix':
            // error with order! 02 34 56
            matrix = [
                values[0], values[2], values[4],
                values[1], values[3], values[5],
                       0 ,        0 ,        1
            ];

            newPoints = points.map(point => applyMatrix(point, matrix));
            break;

        case 'translate':
            const tx = values[0];
            const ty = values.length > 1 ? values[1] : 0;

            newPoints = points.map(point => translate(point, tx, ty));
            break;

        case 'scale':
            const sx = values[0];
            const sy = values.length > 1 ? values[1] : values[0];

            matrix = [
                sx,  0,  0,
                 0, sy,  0,
                 0,  0,  1
            ];

            newPoints = points.map(point => applyMatrix(point, matrix));
            break;

        case 'rotate':
            const doTranslation = values.length > 2;
            radians = (Math.PI / 180) * values[0];
            const sin = Math.sin(radians);
            const cos = Math.cos(radians);

            matrix = [
                cos, -sin,    0,
                sin,  cos,    0,
                  0,    0,    1
            ];

            if (doTranslation) {
                const cx = values[1];
                const cy = values[2];
                newPoints = points.map(point => translate(point, -cx, -cy));
                newPoints = newPoints.map(point => applyMatrix(point, matrix));
                newPoints = newPoints.map(point => translate(point, cx, cy));
            } else {
                newPoints = points.map(point => applyMatrix(point, matrix));
            }

            break;

        case 'skewX':
            radians = (Math.PI / 180) * values[0];
            const tanX = Math.tan(radians);

            matrix = [
                1, tanX,   0,
                0,    1,   0,
                0,    0,   1
            ];

            newPoints = points.map(point => applyMatrix(point, matrix));
            break;

        case 'skewY':
            radians = (Math.PI / 180) * values[0];
            const tanY = Math.tan(radians);

            matrix = [
                   1,   0,   0,
                tanY,   1,   0,
                   0,   0,   1
            ];

            newPoints = points.map(point => applyMatrix(point, matrix));
            break;

        default:
            console.error(`Tansformation: ${transformation.command} not supported!`);

            matrix = [
                1,   0,   0,
                0,   1,   0,
                0,   0,   1
            ];

            newPoints = points.map(point => applyMatrix(point, matrix));
            break;
    }

    return newPoints;
}

function translate(point: XY, tx: number, ty: number): XY {
    const matrix = [
        1 ,        0 ,       tx,
        0 ,        1 ,       ty,
        0 ,        0 ,        1
    ];
    return applyMatrix(point, matrix);
}

function applyMatrix(point: XY, matrix: number[]): XY {
    const c0r0 = matrix[0], c1r0 = matrix[1], c2r0 = matrix[2];
    const c0r1 = matrix[3], c1r1 = matrix[4], c2r1 = matrix[5];
    // const c0r2 = matrix[6], c1r2 = matrix[7], c2r2 = matrix[8];

    const x = point.X;
    const y = point.Y;
    const z = 1;

    const resultX = (x * c0r0) + (y * c1r0) + (z * c2r0);
    const resultY = (x * c0r1) + (y * c1r1) + (z * c2r1);
    return {X: resultX, Y: resultY};
}

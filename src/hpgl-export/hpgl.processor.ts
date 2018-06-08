import { XY } from '../data-model/svg.model';
import { TreeTypes as TT } from '../data-model/model.tree.types';
export module HPGLUtils {

    /**
     * This interface defines the scaling between the model and the plotter's coordinate System
     */
    export interface Scaling {
        outputDimensions: XY;
        inputDimensions: XY;
        offset: XY;
    }

    /**
     * This function converts all provided ModelElements to HPGL output,
     * applies the provided scaling and creates initial overhead.
     */
    export function convertToHPGL(drawables: TT.DrawableNode[], scaling: Scaling): string[] {
        const result: string[] = [];

        result.push('IN;');
        result.push('VS1;');
        result.push('SP1;');

        drawables.reduce(
            (hpglStrings, drawable) => {
                return hpglStrings.concat(
                    ...drawable.paths.map((points, idx) => convertNode(points, drawable.closed[idx], scaling))
                );
            },
            result
        );

        return result;
    }

    /**
     * This function converts the provided ModelElement)s to HPGL output,
     *  and applies the provided scaling.
     */
    function convertNode(points: XY[], closed: boolean, scaling: Scaling): string[] {
        const result: string[] = [];
        const scaledPoints = points.map(point => scale(point, scaling));
        const firstPoint = scaledPoints[0];
        let pathString = 'PD';

        result.push(`PU${firstPoint.X},${firstPoint.Y};`);
        result.push('PD;');

        scaledPoints.forEach((point, idx) => {
            if (idx === 0) { return; }

            pathString += `${point.X},${point.Y}`;

            if (idx % 20 === 0) {
                pathString += ';';
                result.push(pathString);
                pathString = 'PD';
                return;
            }

            if (idx === scaledPoints.length - 1) {
                pathString += ';';
            } else {
                pathString += ',';
            }
        });

        if (closed) {
            pathString += `PD${scaledPoints[0].X},${scaledPoints[0].Y};`;
        }

        result.push(pathString);
        result.push('PU;');

        return result;
    }

    /**
     * Applies scaling to given point.
     */
    function scale(point: XY, scaling: Scaling): XY {
        const xFactor = scaling.outputDimensions.X / scaling.inputDimensions.X;
        const yFactor = scaling.outputDimensions.Y / scaling.inputDimensions.Y;
        const xOut = xFactor * point.X + scaling.offset.X;
        const yOut = yFactor * point.Y + scaling.offset.Y;

        return {
            X: Math.round(xOut),
            Y: Math.round(yOut)
        };
    }
}

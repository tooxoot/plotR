import { XY } from '../data-model/svg.model';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { MathUtils as MU } from '../utils/math.utils';

export module HPGLUtils {

    const apply = (scaling: Scaling) => {
        const xFactor = scaling.outputDimensions.X / scaling.inputDimensions.X;
        const yFactor = scaling.outputDimensions.Y / scaling.inputDimensions.Y;

        const scalingFunction = MU.withXYArgs(
            MU.concat(
                MU.scale([xFactor, yFactor]),
                MU.translate([scaling.offset.X, scaling.offset.Y])
            )
        );

        return (points: XY[]) => points.map(scalingFunction);
    };

    const concatFirstPointIf = (closed: boolean[]) =>
        (path: XY[], idx: number) => closed[idx] ? path.concat(path[0]) : path;

    const toStrings = (p: XY) => `${p.X},${p.Y}`;

    const assignCommands = (pString: string, idx: number) => (
        idx === 0 ? 'PU' :
        idx === 1 ? 'PD' :
        '' ) + pString;

    const addJoints = (pString: string, idx: number, arr: string[]) => pString  + (idx === arr.length - 1 ? ';' : ',');

    const join20 = (lines: string[], pString: string, idx: number) => {
        if (idx % 20 === 0) {
            return [...lines, pString];
        }

        return [...lines.slice(0, -1), lines.slice(-1) + pString];
    };

    const toHpglLines = (hpglStrings: string[], path: XY[]) => [
        ...hpglStrings,
        ...path
            .map(toStrings)
            .map(assignCommands)
            .map(addJoints)
            .reduce(join20, [])
    ];

    const convertNodes = (scaling: Scaling) => ({paths, closed}: TT.DrawableNode) =>
        paths
            .map(apply(scaling))
            .map(concatFirstPointIf(closed))
            .reduce(toHpglLines, [])
            .map(line => line + '\n');

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
        const initialization = ['IN;', 'VS1;', 'SP1;'];
        const convert = convertNodes(scaling);

        return drawables.reduce(
            (hpglLines, drawable) => hpglLines.concat(convert(drawable)),
            initialization
        );
    }
}

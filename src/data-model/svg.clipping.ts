import { XY } from './svg.model';
import { TreeTypes as TT } from '../data-model/model.tree.types';
const ClipperLib = require('clipper-lib');

export enum ClipType {
    Intersect = 0,
    Union = 1,
    Difference = 2,
    Xore = 3
}

/**
 * This module contains functions which take care of clipping ModelElements.
 */
export module ClipUtils {

    /**
     * Clips each of the subjects' ModelElements with the upper elements.
     * @return An array consisting of the clipping results.
     */
    export function clip(subjects: TT.DrawableNode[]): TT.DrawableNode[] {
        const solution: TT.DrawableNode[] = [];

        for (let i = 0; i < subjects.length - 1; i++) {
            if (!subjects[i].outlined) { continue; }
            solution.push(...clipMultipleClips(subjects[i], subjects.slice(i + 1)));
        }

        solution.push(subjects[subjects.length - 1]);

        return solution;
    }

    /**
     * Clips the subject with each of the ModelElements in upperElements.
     * @return An array consisting of the clipping results.
     */
    export function clipMultipleClips(
        subject: TT.DrawableNode,
        clippingNodes: TT.DrawableNode[]
    ): TT.DrawableNode[] {
        let solution: TT.DrawableNode[] = [subject];

        for (let i = 0; i < clippingNodes.length; i++) {
            if (solution === []) { break; }
            const currentClip = clippingNodes[i];
            if (currentClip.filled) { solution = clipMultipleSubjects(solution, currentClip); }
        }

        return solution;
    }

    /**
     * Clips each of the subjects' ModelElements with the clippingElements.
     * @return An array consisting of the clipping results.
     */
    export function clipMultipleSubjects(
        subjects: TT.DrawableNode[],
        clippingNode: TT.DrawableNode
    ): TT.DrawableNode[] {
        let solution: TT.DrawableNode[] = [];

        subjects.forEach(subject => {
            const temp = clipTwo(subject, clippingNode);
            solution = solution.concat(temp);
        });

        return solution;
    }

    /**
     * Clips the subject with the clippingElement.
     * @param regardClosing If true and the subject is closed all clipping results will be closed!
     *                      With this option enabled holes are possible!
     * @return An array consisting of the clipping results.
     */
    export function clipTwo(
        subject: TT.DrawableNode,
        clippingNode: TT.DrawableNode,
        regardClosing: boolean = false,
        clipType: ClipType = ClipType.Difference
    ): TT.DrawableNode[] {
        const clipper = new ClipperLib.Clipper();
        const solutionTree = new ClipperLib.PolyTree();
        const clippingPoints = subject.closed ? subject.points.concat(subject.points[0]) : subject.points;

        clipper.AddPath(clippingPoints, ClipperLib.PolyType.ptSubject, regardClosing && subject.closed);
        clipper.AddPath(clippingNode.points, ClipperLib.PolyType.ptClip, true);
        clipper.Execute(clipType,
                        solutionTree,
                        ClipperLib.PolyFillType.pftNonZero,
                        ClipperLib.PolyFillType.pftNonZero
                        );

        const result = regardClosing && subject.closed ?
                ClipperLib.Clipper.ClosedPathsFromPolyTree(solutionTree) :
                ClipperLib.Clipper.OpenPathsFromPolyTree(solutionTree);

        return result.map((element: Array<XY>) => {
            return TT.newDrawableNode({
                points: element,
                closed: regardClosing && subject.closed,
                filled: regardClosing && subject.filled,
                outlined: subject.outlined,
            });
        });
    }
}

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
 * This module contains functions which take care of clipping DrawableNodes.
 */
export module ClipUtils {

    /**
     * Clips each of the subjects with the upper nodes.
     * @return An array consisting of the clipping results.
     */
    export function clip(subjects: TT.DrawableNode[]): TT.DrawableNode[] {
        return subjects.reduce(
            (solution, subject, idx) => !subject.outlined ?
                solution :
                solution.concat(...clipMultipleClips(subject, subjects.slice(idx + 1))),
            []
        );
    }

    /**
     * Clips the subject with each of the clippingNodes.
     * @return An array consisting of the clipping results.
     */
    export function clipMultipleClips(
        subject: TT.DrawableNode,
        clippingNodes: TT.DrawableNode[]
    ): TT.DrawableNode[] {
        return clippingNodes.reduce(
            (solution, clipping, idx) => solution === [] || !clipping.filled ?
                solution :
                clipMultipleSubjects(solution, clipping),
            [subject]
        );
    }

    /**
     * Clips each of the subjects' with the clippingNode.
     * @return An array consisting of the clipping results.
     */
    export function clipMultipleSubjects(
        subjects: TT.DrawableNode[],
        clippingNode: TT.DrawableNode
    ): TT.DrawableNode[] {
        return subjects.reduce(
            (solution, subject) => solution.concat(clipTwo(subject, clippingNode)),
            []
        );
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

        console.log(subject);
        const clippingPaths = subject.closed.map((closed, idx) =>
            closed ?
                subject.paths[idx].concat(subject.paths[idx][0]) :
                subject.paths[idx]
        );

        clippingPaths.forEach((path, idx) =>
            clipper.AddPath(path, ClipperLib.PolyType.ptSubject, regardClosing && subject.closed[idx])
        );

        clippingNode.paths.forEach(path =>
            clipper.AddPath(path, ClipperLib.PolyType.ptClip, true)
        );

        clipper.Execute(
            clipType,
            solutionTree,
            ClipperLib.PolyFillType.pftEvenOdd,
            ClipperLib.PolyFillType.pftEvenOdd
        );

        const clipperResult = regardClosing && subject.closed[0] ?
                ClipperLib.Clipper.ClosedPathsFromPolyTree(solutionTree) :
                ClipperLib.Clipper.OpenPathsFromPolyTree(solutionTree);

        // return clipperResult.map((element: Array<XY>) => {
        return [TT.newDrawableNode({
            paths: clipperResult as XY[][],
            closed: clipperResult.map(() => regardClosing && subject.closed[0]),
            filled: regardClosing && subject.filled,
            outlined: subject.outlined,
        })];
        // });
        //    */
    }

}

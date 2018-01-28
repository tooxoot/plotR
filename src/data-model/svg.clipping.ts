import { ModelElement } from './svg.model';
import ClipperLib = require('clipper-lib');

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
    export function clip(subjects: ModelElement[]): ModelElement[] {
        const solution: ModelElement[] = [];

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
    export function clipMultipleClips(subject: ModelElement, clippingElements: ModelElement[]): ModelElement[] {
        let solution: ModelElement[] = [subject];

        for (let i = 0; i < clippingElements.length; i++) {
            if (solution === []) { break; }
            const currentClip = clippingElements[i];
            if (currentClip.filled) { solution = clipMultipleSubjects(solution, currentClip); }
        }

        return solution;
    }

    /**
     * Clips each of the subjects' ModelElements with the clippingElements.
     * @return An array consisting of the clipping results.
     */
    export function clipMultipleSubjects(subjects: ModelElement[], clippingElement: ModelElement): ModelElement[] {
        let solution: ModelElement[] = [];

        subjects.forEach(subject => {
            const temp = clipTwo(subject, clippingElement);
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
        subject: ModelElement,
        clippingElement: ModelElement,
        regardClosing: boolean = false,
        clipType: ClipType = ClipType.Difference
    ): ModelElement[] {
        const clipper = new ClipperLib.Clipper();
        const solutionTree = new ClipperLib.PolyTree();
        const clippingPoints = subject.closed ? subject.points.concat(subject.points[0]) : subject.points;

        clipper.AddPath(clippingPoints, ClipperLib.PolyType.ptSubject, regardClosing && subject.closed);
        clipper.AddPath(clippingElement.points, ClipperLib.PolyType.ptClip, true);
        clipper.Execute(clipType,
                        solutionTree,
                        ClipperLib.PolyFillType.pftNonZero,
                        ClipperLib.PolyFillType.pftNonZero
                        );

        const result = regardClosing && subject.closed ?
                ClipperLib.Clipper.ClosedPathsFromPolyTree(solutionTree) :
                ClipperLib.Clipper.OpenPathsFromPolyTree(solutionTree);

        return result.map(element => {
            return {
                points: element,
                closed: regardClosing && subject.closed,
                filled: regardClosing && subject.filled,
                outlined: subject.outlined,
            };
        });
    }
}

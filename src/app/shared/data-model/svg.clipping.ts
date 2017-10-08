import {ModelElement} from './svg.model'
import ClipperLib = require('clipper-lib');
import {XY, ClipStruct} from '../types'


class ClipResult {
    constructor(
        public points: [number, number][],
        public closed: boolean
    ) {};
}

// function getClipStructs(model: ModelElement[]): ModelElement[] {
//     return model.map(element => {
//         return {
//             points: getScaledClipperPath(element),
//             closed: element.closed,
//             filled: element.filled,
//             outlined: element.outlined,
//             id: -1
//         }
//     });
// }

// function getScaledClipperPath(model: ModelElement): XY[] {
//     return model.points.map((point) => {
//         return {X: point[0] * 100, Y: point[1] * 100};
//     });
// }

export function clip(model: ModelElement[]): ModelElement[] {
    // const sol = clipTwo(model[0].getPointsAsClipperPath(), model[1].getPointsAsClipperPath(), true)
    console.log("\n\n\n\n");
    // return sol

    const solution: ModelElement[] = [];
    const subjects: ModelElement[] = model;

    for (let i = 0; i < subjects.length - 1; i++) {
        console.log('clip cycle i= ' + i)
        solution.push(...clipWithUpper(subjects[i], subjects.slice(i + 1)));
    }

    solution.push(subjects.pop())

    // solution.forEach(e => {
    //     e.points.forEach(p => { p.X /= 100; p.Y /= 100; });
    // });

    return solution;
}

function clipWithUpper(subject: ModelElement, clips: ModelElement[]): ModelElement[] {
    if (!subject.closed) { subject.points.push(subject.points[1]) }

    let solution: ModelElement[] = [subject];
    // let currentClip = clips[0];

    for (let i = 0; i < clips.length; i++) {
        console.log('sol' + solution.length)
        if (solution === []) { break; }
        const currentClip = clips[i];
        if (currentClip.filled) { solution = clipSubjects(solution, currentClip); }
    }

    // while (currentClip && solution !== [] ) {
    //     solution = clipSubjects(solution, currentClip, closed);
    //     currentClip = clips[i++];
    // }

    return solution;
}

function clipSubjects(subjects: ModelElement[], clip: ModelElement): ModelElement[] {
    let solution: ModelElement[] = [];
    // console.log(subjects)
    // console.log(clip)
    subjects.forEach(subject => {
    // console.log(subject)
    // console.log(clip)
        const temp = clipTwo(subject, clip)
        console.log(temp)
        solution = solution.concat(temp)
    });
    console.log(solution)

    return solution;
}

function clipTwo(subject: ModelElement, clip: ModelElement): ModelElement[] {
    const clipper = new ClipperLib.Clipper();
    const solutionTree = new ClipperLib.PolyTree();
    console.log(subject)
    console.log(clip)


    // ClipperLib.JS.ScaleUpPaths(subject, 100);
    // ClipperLib.JS.ScaleUpPaths(clip, 100);

    clipper.AddPath(subject.points, ClipperLib.PolyType.ptSubject, subject.closed);
    clipper.AddPath(clip.points, ClipperLib.PolyType.ptClip, true);

    const filltype = 0;

    // clipper.Execute(  ClipperLib.ClipType.ctDifference,
    //                   solutionTree,
    //                   filltype,
    //                   filltype
    //                 );

    clipper.Execute(  ClipperLib.ClipType.ctDifference,
                      solutionTree,
                      ClipperLib.PolyFillType.pftNonZero,
                      ClipperLib.PolyFillType.pftNonZero
                    );
    console.log('SOLTREE')
    console.log(solutionTree)

    const result = subject.closed ?
            ClipperLib.Clipper.ClosedPathsFromPolyTree(solutionTree) :
            ClipperLib.Clipper.OpenPathsFromPolyTree(solutionTree);

    // filter out holes!

    return result.map(element => {
        return {
            points: element,
            closed: subject.closed,
            filled: subject.filled,
            outlined: subject.outlined,
            id: subject.id,
        }
    });

    // return  subject.closed ?
    //         ClipperLib.Clipper.ClosedPathsFromPolyTree(solutionTree) :
    //         ClipperLib.Clipper.OpenPathsFromPolyTree(solutionTree);
}

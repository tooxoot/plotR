import {ModelElement} from './svg.model'
import ClipperLib = require('clipper-lib');
import {XY, ClipStruct} from '../types'


class ClipResult {
    constructor(
        public points: [number, number][],
        public closed: boolean
    ) {};
}


export function clip(model: ModelElement[]): ModelElement[] {
    const solution: ModelElement[] = [];
    const subjects: ModelElement[] = model;

    for (let i = 0; i < subjects.length - 1; i++) {
        if (!subjects[i].outlined) { continue; }
        console.log('>>>next_subject')
        solution.push(...clipWithUpper(subjects[i], subjects.slice(i + 1)));
    }

    solution.push(subjects.pop())

    return solution;
}

function clipWithUpper(subject: ModelElement, clips: ModelElement[]): ModelElement[] {
    if (subject.closed) {
        subject.points.push(subject.points[0]);
    }

    let solution: ModelElement[] = [subject];

    for (let i = 0; i < clips.length; i++) {
        if (solution === []) { break; }
        const currentClip = clips[i];
        if (currentClip.filled) { solution = clipSubjects(solution, currentClip); }
    }

    return solution;
}

function clipSubjects(subjects: ModelElement[], clip: ModelElement): ModelElement[] {
    let solution: ModelElement[] = [];

    subjects.forEach(subject => {
        const temp = clipTwo(subject, clip)
        console.log(temp)
        solution = solution.concat(temp)
    });

    return solution;
}

function clipTwo(subject: ModelElement, clip: ModelElement, regardClosing: boolean = false): ModelElement[] {
    const clipper = new ClipperLib.Clipper();
    const solutionTree = new ClipperLib.PolyTree();

    // console.lo

    clipper.AddPath(subject.points, ClipperLib.PolyType.ptSubject, regardClosing && subject.closed);
    clipper.AddPath(clip.points, ClipperLib.PolyType.ptClip, true);

    clipper.Execute(  ClipperLib.ClipType.ctDifference,
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
            id: subject.id,
        }
    });
}

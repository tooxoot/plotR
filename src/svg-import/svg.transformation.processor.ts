import { XY } from '../data-model/svg.model';
import { extractValues } from './svg.input.processor';
import { MathUtils as MU } from '../utils/math.utils';

interface Command {
    indicator: string;
    values: number[];
}

export function applyTransformations(points: XY[], svgChild: HTMLElement): XY[] {
    if (!svgChild.getAttribute('transform')) { return points; }

    return extractCommands(svgChild.getAttribute('transform').trim())
        .reverse()
        .reduce(
            (result, transformation) => applyCommand(result, transformation),
            points
        );
}

function extractCommands(attributeContent: string): Command[] {
    const tRegex = /(matrix|translate|scale|rotate|skewX|skewY)\((.+?)\)/g;
    const commands: Command[] = [];
    let currentMatch;

    while (currentMatch = tRegex.exec(attributeContent)) {
        commands.push({
            indicator: currentMatch[1],
            values: extractValues(currentMatch[2])
        });
    }
    console.log(commands);
    return commands;
}

function applyCommand(points: XY[], {values, indicator}: Command): XY[] {
    if (!['matrix', 'translate', 'scale', 'rotate', 'skewX', 'skewY'].includes(indicator)) {
        console.error(`Tansformation: ${indicator} not supported!`);

        return points.map(p => p);
    }

    const fill = (count: number) => () => {
        const filledValues = [...values];
        while (filledValues.length < count) { filledValues.push(0); }
        return filledValues;
    };

    const valueCheck: () => number[] = {
        'matrix': () => {
            const filledValues = fill(6)();
            return [
                filledValues[0], filledValues[2], filledValues[4],
                filledValues[1], filledValues[3], filledValues[5],
            ];
        },
        'translate': fill(2),
        'scale': () => {
            const filledValues = fill(1)();
            return filledValues.length < 2 ? filledValues.concat(filledValues) : filledValues;
        },
        'rotate': fill(3),
        'skewX': fill(1),
        'skewY': fill(1),
    }[indicator];

    const checkedValues = valueCheck();

    const transformation: (vals: number[]) => number[] = {
        'matrix': MU.transform(checkedValues),
        'translate': MU.translate(checkedValues),
        'scale': MU.scale(checkedValues),
        'rotate': MU.rotate(checkedValues),
        'skewX': MU.skewX(checkedValues),
        'skewY': MU.skewY(checkedValues),
    }[indicator];

    return points.map(MU.withXYArgs(transformation));
}

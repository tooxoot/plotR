import {ModelElement} from '../data-model/svg.model'

export function processModel(model: ModelElement[]): string[] {
    const result: string[] = [];

    model.forEach(modelElement => {
        result.push(...processModelElement(modelElement));
    });

    return result;
}

export function processModelElement(modelElement: ModelElement): string[] {
    const result: string[] = [];
    const M = modelElement.points.shift();
    let plotstring = 'PA ';

    result.push('PU')
    result.push(`PA ${M.X} ${M.Y}`)
    result.push('PD')

    modelElement.points.forEach(p => {
        plotstring += ` ${p.X} ${p.Y}`;
    });

    result.push(plotstring);

    return result;
}

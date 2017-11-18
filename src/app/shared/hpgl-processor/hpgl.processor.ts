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
    const firstPoint = modelElement.points[0];
    let plotstring = 'PA';

    result.push('PU')
    result.push(`PA${firstPoint.X} ${firstPoint.Y}`)
    result.push('PD')

    modelElement.points.forEach((point, idx) => {
        if (idx === 0) { return; }
        if (idx % 100 === 0) {
            result.push(plotstring);
            plotstring = 'PA'
        }
        plotstring += `${point.X},${point.Y};`;
    });

    if (modelElement.closed) {
        plotstring += `${modelElement.points[0].X},${modelElement.points[0].Y};`
    }

    result.push(plotstring);
    result.push('PU')

    return result;
}

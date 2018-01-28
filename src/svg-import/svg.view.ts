import { ModelElement } from '../data-model/svg.model';

export function calculateSVGString(modelElement: ModelElement): string {
    const idString = 'SVG_ELEMENT_' + modelElement.id;
    const dString = calcDString(modelElement);
    const fillString = modelElement.filled ? 'grey' : 'none';
    const strokeStrink = modelElement.outlined ? 'black' : 'none';

    return `<path id="${idString}" d="${dString}" fill="${fillString}" stroke="${strokeStrink}"/>`;
}

function calcDString(modelElement: ModelElement): string {
    let result = '';

    modelElement.points.forEach((point, i) => {
      (i === 0) ? result += 'M' : result += ' L';
      result += ` ${point.X / 100} ${point.Y / 100}`;
    });

    if (modelElement.closed) { result += ' Z'; }

    return result;
}

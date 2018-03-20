import * as React from 'react';
import {GraphTypes as GT } from '../data-model/model.graph.types';

interface Props {
    drawable: GT.DrawableElement;
    selected: boolean;
}

export const PATH_ELEMENT: React.SFC<Props> = ({drawable, selected}) => {
    return (
        <path
            id={'SVG_ELEMENT_' + drawable.id}
            d={calcDString(drawable)}
            fill={drawable.filled ? 'grey' : 'none'}
            stroke={selected ? 'red' : drawable.outlined ? 'black' : 'none'}
        />
    );
};

function calcDString(drawable: GT.DrawableElement): string {
    let result = '';

    drawable.points.forEach((point, i) => {
      (i === 0) ? result += 'M' : result += ' L';
      result += ` ${point.X / 100} ${point.Y / 100}`;
    });

    if (drawable.closed) { result += ' Z'; }

    return result;
}

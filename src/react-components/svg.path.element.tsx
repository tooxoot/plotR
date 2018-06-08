import * as React from 'react';
import {TreeTypes as TT } from '../data-model/model.tree.types';

interface Props {
    drawable: TT.DrawableNode;
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

function calcDString(drawable: TT.DrawableNode): string {
    let result = '';

    drawable.paths.forEach((path, idx) => {
        path.forEach((point, i) => {
            (i === 0) ? result += ' M' : result += ' L';
            result += ` ${point.X / 100} ${point.Y / 100}`;
        });
        if (drawable.closed[idx]) { result += ' Z'; }
    });

    return result;
}

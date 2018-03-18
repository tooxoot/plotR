import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { GraphUtils as GU } from '../data-model/model.graph.utils';

interface ThisProps {
    selectedIds: number[];
    drawables: GT.DrawableElement[];
}

const definition: React.SFC<ThisProps> = (props) => {
    const { selectedIds, drawables } = props;

    return (
        <div id="svg-view">
            <svg id="svg-view">
                {
                    drawables.map(
                        e => convertToPathElement(e, selectedIds.includes(e.id))
                    )
                }
            </svg>
        </div>
    );
};

const stateToProps = (state: ReduxState): ThisProps => ({
    selectedIds: state.selectedIds,
    drawables: GU.getDrawables(state.elementIndex, state.childRelations),
});

export const SVG_VIEW_COMPONENT = ReactRedux.connect(
    stateToProps
)(definition);

function convertToPathElement(modelElement: GT.DrawableElement, selected: boolean = false): JSX.Element {
    const idString = 'SVG_ELEMENT_' + modelElement.id;
    const dString = calcDString(modelElement);
    const fillString = modelElement.filled ? 'grey' : 'none';
    let strokeString = modelElement.outlined ? 'black' : 'none';
    strokeString = selected ? 'red' : strokeString;

    return (<path id={idString} d={dString} fill={fillString} stroke={strokeString}/>);
}

function calcDString(modelElement: GT.DrawableElement): string {
    let result = '';

    modelElement.points.forEach((point, i) => {
      (i === 0) ? result += 'M' : result += ' L';
      result += ` ${point.X / 100} ${point.Y / 100}`;
    });

    if (modelElement.closed) { result += ' Z'; }

    return result;
}

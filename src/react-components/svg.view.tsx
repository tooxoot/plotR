import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { GraphUtils as GU } from '../data-model/model.graph.utils';
import { PATH_ELEMENT } from './svg.path.element';

export interface Props {
    selectedIds: number[];
    drawables: GT.DrawableElement[];
    dimensions: GT.Dimensions;
}

export const SVG_VIEW_COMPONENT: React.SFC<Props> = ({selectedIds, drawables, dimensions}) => (
    <div className="svg-view">
        <svg className="svg-view" width={dimensions.X} height={dimensions.Y}>
            {
                drawables.map(
                    d => (<PATH_ELEMENT drawable={d} selected={selectedIds.includes(d.id)}/>)
                )
            }
        </svg>
    </div>
);

const stateToProps = (state: ReduxState): Props => ({
    selectedIds: state.selectedIds,
    drawables: GU.getDrawables(
        state.elementIndex,
        state.childRelations,
    ),
    dimensions: state.dimensions,
});

export const SVG_VIEW = ReactRedux.connect(
    stateToProps
)(SVG_VIEW_COMPONENT);

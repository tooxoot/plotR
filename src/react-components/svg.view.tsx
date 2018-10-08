import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { TreeUtils as TU } from '../data-model/model.tree.utils';
import { PATH_ELEMENT } from './svg.path.element';

export interface Props {
    selectedIds: number[];
    drawables: TT.DrawableNode[];
    dimensions: TT.Dimensions;
}

export const SVG_VIEW_COMPONENT: React.SFC<Props> = ({selectedIds, drawables, dimensions}) => (
    <div className="svg-view">
        <svg className="svg-view" width={dimensions.X / 100} height={dimensions.Y / 100}>
            {
                drawables.map((d, idx) =>
                    (<PATH_ELEMENT key={idx} drawable={d} selected={selectedIds.includes(d.id)}/>)
                )
            }
        </svg>
    </div>
);

const stateToProps = (state: ReduxState): Props => ({
    selectedIds: state.selectedIds,
    drawables: TU.getDrawables(
        state.nodeIndex,
        state.childRelations,
    ),
    dimensions: state.dimensions,
});

export const SVG_VIEW = ReactRedux.connect(
    stateToProps
)(SVG_VIEW_COMPONENT);

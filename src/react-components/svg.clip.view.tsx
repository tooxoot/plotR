import * as ReactRedux from 'react-redux';
import { ReduxState } from '../redux-model/redux.state';
import { Props, SVG_VIEW_COMPONENT } from './svg.view';
import { GraphUtils as GU } from '../data-model/model.graph.utils';

const stateToProps = (state: ReduxState): Props => ({
    selectedIds: state.selectedIds,
    drawables: GU.getDrawables(
        state.clippedGraph.elementIndex,
        state.clippedGraph.relations.childRelations,
    ),
    dimensions: state.dimensions,
});

export const SVG_CLIP_VIEW = ReactRedux.connect(
    stateToProps
)(SVG_VIEW_COMPONENT);

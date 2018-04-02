import * as ReactRedux from 'react-redux';
import { ReduxState } from '../redux-model/redux.state';
import { Props, SVG_VIEW_COMPONENT } from './svg.view';
import { TreeUtils as TU } from '../data-model/model.tree.utils';

const stateToProps = (state: ReduxState): Props => ({
    selectedIds: state.selectedIds,
    drawables: TU.getDrawables(
        state.clippedTree.nodeIndex,
        state.clippedTree.relations.childRelations,
    ),
    dimensions: state.dimensions,
});

export const SVG_CLIP_VIEW = ReactRedux.connect(
    stateToProps
)(SVG_VIEW_COMPONENT);

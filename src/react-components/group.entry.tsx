import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { TreeUtils as TU } from '../data-model/model.tree.utils';
import { ReduxState, ListAction, IdAction } from '../redux-model/redux.state';
import { NodeToggles } from '../redux-model/redux.toggle.actions';

const dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleSelectList: (ids: number[]) => dispatch<ListAction>(NodeToggles.actionSelectList(ids)),
        toggleHideList: (id: number) => dispatch<IdAction>(NodeToggles.actionHideChildren(id)),
    }
);

interface Props {
    id: number;
    childRelations: TT.ChildRelations;
    childrenSelected: boolean;
    // tslint:disable no-any
    toggleSelectList: (ids: number[]) => any;
    toggleHideList: (id: number) => any;
    // tslint:enable no-any    
}

const COMPONENT: React.SFC<Props> = (
    {
        id,
        childRelations,
        childrenSelected,
        toggleSelectList,
        toggleHideList
    }: Props
) => (
    <div id={`node-${id}`} className="me-tool">
        <button
            className="me-select-box"
            onClick={() => toggleSelectList(TU.getAncestors(childRelations, { subRootId: id }))}
        >
            {childrenSelected ? 'X' : 'O'}
        </button>
        <button
            className="me-hide-box"
            onClick={() => toggleHideList(id)}
        >
            Y
        </button>
        <span className="me-name">
            {id} - Group
        </span>
    </div>
);

export const GROUP_ENTRY = ReactRedux.connect(
    null,
    dispatchToProps
)(COMPONENT);

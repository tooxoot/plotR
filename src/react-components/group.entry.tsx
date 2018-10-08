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
    showSubtree: boolean;
    // tslint:disable no-any
    toggleSelectList: (ids: number[]) => any;
    toggleHideList: (id: number) => any;
    // tslint:enable no-any
}

const COMPONENT: React.SFC<Props> = (
    {
        id,
        childRelations,
        showSubtree,
        toggleSelectList,
        toggleHideList
    }: Props
) => (
    <div className="list-item item-margin-small">
        <button
            className="button"
            onClick={() => toggleSelectList(TU.getAncestors(childRelations, { subRootId: id }))}
        >
            SELECT SUBTREE
        </button>
        <button
            className="button content-middle-centered"
            onClick={() => { toggleHideList(id); }}
        >
            SHOW SUBTREE
            <input
                type="checkbox"
                className="me-hide-box"
                disabled={true}
                checked={showSubtree}
            />
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

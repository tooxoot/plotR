import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { ReduxState, ListAction } from '../redux-model/redux.state';
import { NodeToggles } from '../redux-model/redux.toggle.actions';

const dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleSelectList: (ids: number[]) => dispatch<ListAction>(NodeToggles.actionSelectList(ids)),
    }
);

interface Props {
    id: number;
    childRelations: TT.ChildRelations;
    // tslint:disable:nextLine no-any
    toggleSelectList: (ids: number[]) => any;
}

const COMPONENT: React.SFC<Props> = (
    {
        id,
        childRelations,
        toggleSelectList
    }: Props
) => (
    <div id={`node-${id}`} className="me-tool">
        <button
            className="me-select-box"
            type="checkbox"
            onClick={() => toggleSelectList(childRelations[id])}
        >
            X
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

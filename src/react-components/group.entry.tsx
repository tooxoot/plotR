import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { ReduxState, ListAction } from '../redux-model/redux.state';
import { ElementToggles } from '../redux-model/redux.toggle.actions';

const dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleSelectList: (ids: number[]) => dispatch<ListAction>(ElementToggles.actionSelectList(ids)),
    }
);

interface Props {
    id: number;
    childRelations: GT.ChildRelations;
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
    <div id={`element-${id}`} className="me-tool">
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

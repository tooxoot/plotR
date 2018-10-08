import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { ReduxState, IdAction } from '../redux-model/redux.state';
import { NodeToggles } from '../redux-model/redux.toggle.actions';

const  dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleSelect: (id: number) => dispatch<IdAction>(NodeToggles.actionSelect(id)),
        toggleFilled: (id: number) => dispatch<IdAction>(NodeToggles.actionFilling(id)),
        toggleClosed: (id: number) => dispatch<IdAction>(NodeToggles.actionClose(id))
    }
);

interface Props {
    id: number;
    isSelected: boolean;
    drawable: TT.DrawableNode;
    // tslint:disable no-any
    toggleSelect: (id: number) => any;
    toggleFilled: (id: number) => any;
    toggleClosed: (id: number) => any;
    // tslint:enable no-any
}

const COMPONENT: React.SFC<Props> = (
    {
        id,
        isSelected,
        drawable,
        toggleSelect,
        toggleFilled,
        toggleClosed
    }: Props
) => (
    <div className="list-item item-margin-small">
        <button
            className="small-circle content-middle-centered"
            onClick={() => toggleSelect(id)}
        >
            <input
                type="checkbox"
                checked={isSelected}
            />
        </button>
        <button
            className="content-middle-centered"
            onClick={() => toggleFilled(id)}
        >
            IS FILLED
            <input
                className="me-filled-box"
                type="checkbox"
                checked={drawable.filled}
            />
        </button>
        <span className="me-name">
            {id} - Drawable
        </span>
    </div>
);

export const DRAWABLE_ENTRY = ReactRedux.connect(
    null,
    dispatchToProps
)(COMPONENT);

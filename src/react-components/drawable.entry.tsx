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
    <div id={`node-${id}`} className="me-tool">
        <input
            className="me-select-box"
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(id)}
        />
        <span className="me-name">
            {id} - Drawable
        </span>
        <input
            className="me-filled-box"
            type="checkbox"
            checked={drawable.filled}
            onChange={() => toggleFilled(id)}
        />
    </div>
);

export const DRAWABLE_ENTRY = ReactRedux.connect(
    null,
    dispatchToProps
)(COMPONENT);

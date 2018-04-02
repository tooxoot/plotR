import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { ReduxState, IdAction } from '../redux-model/redux.state';
import { ElementToggles } from '../redux-model/redux.toggle.actions';

const  dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleSelect: (id: number) => dispatch<IdAction>(ElementToggles.actionSelect(id)),
        toggleFilled: (id: number) => dispatch<IdAction>(ElementToggles.actionFilling(id)),
        toggleClosed: (id: number) => dispatch<IdAction>(ElementToggles.actionClose(id))
    }
);

interface Props {
    id: number;
    isSelected: boolean;
    drawable: GT.DrawableElement;
    // tslint:disable: no-any
    toggleSelect: (id: number) => any;
    toggleFilled: (id: number) => any;
    toggleClosed: (id: number) => any;
    // tslint:enable: no-any
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
    <div id={`element-${id}`} className="me-tool">
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
            className="me-closed-box"
            type="checkbox"
            checked={drawable.closed}
            onChange={() => toggleClosed(id)}
        />
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

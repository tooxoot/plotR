import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { SVG_VIEW } from './svg.view';
import { SVG_CLIP_VIEW } from './svg.clip.view';
import { SVG_SOURCE_VIEW } from './svg.source.view';
import { ToggleDebugView } from '../redux-model/redux.debug.view.actions';
import { ClipTree } from '../redux-model/redux.clip.tree.action';

interface Props {
    hidden: boolean;
}

const SVG_DEBUG_VIEW_COMPONENT: React.SFC<Props> = ({hidden}) => (
    <div id="debugview" hidden={hidden}>
        <SVG_SOURCE_VIEW />
        <SVG_VIEW />
        <SVG_CLIP_VIEW  />
    </div>
);

const stateToProps = (state: ReduxState): Props => ({
    hidden: !state.showDebugView,
});

export const SVG_DEBUG_VIEW = ReactRedux.connect(
    stateToProps
)(SVG_DEBUG_VIEW_COMPONENT);

interface ButtonProps {
    hidden: boolean;
    // tslint:disable: no-any
    toggleHidden: () => any;
}

const SVG_DEBUG_BUTTON_COMPONENT: React.SFC<ButtonProps> = ({hidden, toggleHidden}) => (
    <div className="button content-middle-centered" onClick={() => toggleHidden()}>
        <div>SHOW DEBUG VIEW:</div>
        <input
            type="checkbox"
            checked={!hidden}
        />
    </div>
);

const  dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleHidden: (id: number) => {
            dispatch<{type: string}>(ClipTree.action());
            dispatch<{type: string}>(ToggleDebugView.action());
        },
    }
);

export const SVG_DEBUG_BUTTON = ReactRedux.connect(
    stateToProps,
    dispatchToProps
)(SVG_DEBUG_BUTTON_COMPONENT);

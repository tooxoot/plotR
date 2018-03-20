import * as React from 'react';
import * as ReactRedux from 'react-redux';
import { ReduxState } from '../redux-model/redux.state';

interface Props {
    svgSource: HTMLElement;
}

export const SVG_SOURCE_VIEW_COMPONENT: React.SFC<Props> = ({svgSource}) => {
    return (
        <div className="source-view" dangerouslySetInnerHTML={{__html: svgSource.outerHTML}}/>
    );
};

const stateToProps = (state: ReduxState): Props => ({
    svgSource: state.svgSource,
});

export const SVG_SOURCE_VIEW = ReactRedux.connect(
    stateToProps
)(SVG_SOURCE_VIEW_COMPONENT);

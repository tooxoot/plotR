import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { LineFilling } from '../redux-model/redux.line.filling';

interface Props {
    selectedIds: number[];
    // tslint:disable: no-any
    fill: (args: LineFilling.Arguments) => any;
    // tslint:enable: no-any
}

const FILL_INPUT_COMPONENT: React.SFC<Props> = ({selectedIds, fill}) => {
    const fillAll = () => selectedIds.forEach(id => fill({id, angle: 45, offset: 0, spacing: 5000}));

    return (
        <div>
            <button onClick={() => fillAll()}> FILL </button>
        </div>
    );
};

const stateToProps = (state: ReduxState) => {
    return {
        selectedIds: state.selectedIds,
    };
};

const  dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        fill: (args: LineFilling.Arguments) => dispatch<LineFilling.Action>(LineFilling.action(args)),
    }
);

export const FILL_INPUT = ReactRedux.connect(
    stateToProps,
    dispatchToProps
)(FILL_INPUT_COMPONENT);

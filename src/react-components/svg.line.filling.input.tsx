import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { ReduxState } from '../redux-model/redux.state';
import { LineFilling } from '../redux-model/redux.line.filling';

interface Props {
    selectedIds: number[];
    // tslint:disable:next-line no-any
    fill: (args: LineFilling.Arguments) => any;
}

interface State {
    angle: number;
    offset: number;
    spacing: number;
}

class FillComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            angle: 45,
            offset: 0,
            spacing: 5000,
        };
      }

    render() {
        const fillAll = () => this.props.selectedIds.forEach(
            id => this.props.fill({
                id,
                ...this.state
            })
        );

        return (
            <div>
                Angle:
                <input
                    className="angle-input"
                    type="number"
                    value={this.state.angle}
                    onChange={(e) => {
                        this.setState({angle: +(e.currentTarget.value) % 180});
                        console.log(this.state);
                    }
                    }
                />
                Offset:
                <input
                    className="offset-input"
                    type="number"
                    value={(this.state.offset)}
                    onChange={(e) => this.setState({offset: Math.max(+(e.currentTarget.value), 0)})}
                />
                Spacing:
                <input
                    className="spacing-input"
                    type="number"
                    value={this.state.spacing}
                    onChange={(e) => this.setState({spacing: Math.max(+(e.currentTarget.value), 1)})}
                />
                <button onClick={fillAll}> FILL </button>
            </div>
        );
    }
}

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
)(FillComponent);

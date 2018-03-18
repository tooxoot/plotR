import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { GraphUtils as GU } from '../data-model/model.graph.utils';
import { ReduxState } from '../redux-model/redux.state';
import * as ToggleActions from '../redux-model/redux.toggle.actions';

interface ThisProps {
    selectedIds: number[];
    elementIndex: GT.ElementIndex;
    childRelations: GT.ChildRelations;
    // tslint:disable: no-any
    toggleSelect: (id: number) => any;
    toggleFilled: (id: number) => any;
    toggleClosed: (id: number) => any;
    // tslint:enable: no-any
}

const definition: React.SFC<ThisProps> = (props) => {
    const {
        selectedIds,
        elementIndex,
        childRelations,
        toggleSelect,
        toggleFilled,
        toggleClosed
    } = props;

    const toDo = (results: JSX.Element[], currentId: number): JSX.Element[] => {
        const isSelected = selectedIds.includes(currentId);
        const element = elementIndex[currentId];
        const drawable = element.type === GT.Types.DRAWABLE ? element as GT.DrawableElement : null;

        results.push (
            <div className="me-tool">
            <input
                className="me-select-box"
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(currentId)}
            />
            <span className="me-name">
            {currentId} - {elementIndex[currentId].type}
            </span>
            { drawable ? (
                <input
                    className="me-closed-box"
                    type="checkbox"
                    checked={drawable.closed}
                    onChange={() => toggleClosed(currentId)}
                />
                ) : null
            }
            { drawable ? (
                <input
                    className="me-filled-box"
                    type="checkbox"
                    checked={drawable.filled}
                    onChange={() => toggleFilled(currentId)}
                />
                ) : null
            }
            </div>
        );
        return results;
    };

    return (
        <div>
        {GU.reduceTree(0, toDo, childRelations)}
        </div>
    );
};

const stateToProps = (state: ReduxState) => {
    return {
        selectedIds: state.selectedIds,
        elementIndex: state.elementIndex,
        childRelations: state.childRelations,
    };
};

const  dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleSelect: (id: number) => dispatch<ToggleActions.ToggleSelect>(ToggleActions.toggleSelect(id)),
        toggleFilled: (id: number) => dispatch<ToggleActions.ToggleFilling>(ToggleActions.toggleFilling(id)),
        toggleClosed: (id: number) => dispatch<ToggleActions.ToggleClose>(ToggleActions.toggleClose(id))
    }
);

export const Selectlist = ReactRedux.connect(
    stateToProps,
    dispatchToProps
)(definition);

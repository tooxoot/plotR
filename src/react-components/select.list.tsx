import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { GraphUtils as GU } from '../data-model/model.graph.utils';
import { ReduxState, IdAction } from '../redux-model/redux.state';
import { ElementToggles } from '../redux-model/redux.toggle.actions';

interface Props {
    selectedIds: number[];
    elementIndex: GT.ElementIndex;
    parentRelation: GT.ParentRelations;
    childRelations: GT.ChildRelations;
    // tslint:disable: no-any
    toggleSelect: (id: number) => any;
    toggleFilled: (id: number) => any;
    toggleClosed: (id: number) => any;
    // tslint:enable: no-any
}

const SELECT_LIST_COMPONENT: React.SFC<Props> = (props) => {
    const {
        selectedIds,
        elementIndex,
        parentRelation,
        childRelations,
        toggleSelect,
        toggleFilled,
        toggleClosed
    } = props;

    const toDo = (results: {id: number, el: JSX.Element}[], currentId: number): {id: number, el: JSX.Element}[] => {
        const isSelected = selectedIds.includes(currentId);
        const element = elementIndex[currentId];
        const drawable = element.type === GT.Types.DRAWABLE ? element as GT.DrawableElement : null;
        const idx = results.findIndex((res) => res.id === parentRelation[currentId]);
        results.splice(idx, 0, { id: currentId, el: (
            <div id={`element-${currentId}`} className="me-tool">
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
        )});
        return results;
    };
    const initialValue = [{ id: 0, el: (<div/>)}];
    return (
        <div>
            {GU.reduceTree(0, toDo, childRelations, GU.BREADTH, initialValue).map(kv => kv.el)}
        </div>
    );
};

const stateToProps = (state: ReduxState) => {
    return {
        selectedIds: state.selectedIds,
        elementIndex: state.elementIndex,
        childRelations: state.childRelations,
        parentRelation: state.parentRelations,
    };
};

const  dispatchToProps = (dispatch: ReactRedux.Dispatch<ReduxState>) => (
    {
        toggleSelect: (id: number) => dispatch<IdAction>(ElementToggles.actionSelect(id)),
        toggleFilled: (id: number) => dispatch<IdAction>(ElementToggles.actionFilling(id)),
        toggleClosed: (id: number) => dispatch<IdAction>(ElementToggles.actionClose(id))
    }
);

export const SELECT_LIST = ReactRedux.connect(
    stateToProps,
    dispatchToProps
)(SELECT_LIST_COMPONENT);

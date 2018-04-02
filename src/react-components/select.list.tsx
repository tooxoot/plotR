import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { GraphUtils as GU } from '../data-model/model.graph.utils';
import { ReduxState } from '../redux-model/redux.state';
import { GROUP_ENTRY } from './group.entry';
import { DRAWABLE_ENTRY } from './drawable.entry';
const stateToProps = (state: ReduxState) => {
    return {
        selectedIds: state.selectedIds,
        elementIndex: state.elementIndex,
        childRelations: state.childRelations,
    };
};

interface Props {
    selectedIds: number[];
    elementIndex: GT.ElementIndex;
    childRelations: GT.ChildRelations;
}

const SELECT_LIST_COMPONENT: React.SFC<Props> = (
    {
        selectedIds,
        elementIndex,
        // parentRelation: GT.ParentRelations;
        childRelations,
    }: Props
) => {
    const toDo: GU.treeReducer<JSX.Element[]> = (entries, currentId) => {
        const e = elementIndex[currentId];
        const isSelected = selectedIds.includes(e.id);

        switch (e.type) {
            case GT.Types.GROUP:
                entries.unshift((<GROUP_ENTRY id={e.id} childRelations={childRelations}/>));
                break;
            case GT.Types.DRAWABLE:
                entries.unshift(
                    <DRAWABLE_ENTRY
                        id={e.id}
                        isSelected={isSelected}
                        drawable={e as GT.DrawableElement}
                    />
                );
                break;
            default:
            console.error(`Unknown Element Type ${e.type}`);
        }

        return entries;
    };

    return (

        <div>
            {GU.reduceDepthFirst(0, toDo, childRelations, [])}
        </div>
    );
};

export const SELECT_LIST = ReactRedux.connect(
    stateToProps
)(SELECT_LIST_COMPONENT);

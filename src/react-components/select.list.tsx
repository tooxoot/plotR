import * as ReactRedux from 'react-redux';
import * as React from 'react';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { TreeUtils as TU } from '../data-model/model.tree.utils';
import { ReduxState } from '../redux-model/redux.state';
import { GROUP_ENTRY } from './group.entry';
import { DRAWABLE_ENTRY } from './drawable.entry';

const stateToProps = (state: ReduxState) => {
    return {
        selectedIds: state.selectedIds,
        hiddenSubTreeIds: state.hiddenSubTreeIds,
        nodeIndex: state.nodeIndex,
        childRelations: state.childRelations,
    };
};

interface Props {
    selectedIds: number[];
    hiddenSubTreeIds: number[];    
    nodeIndex: TT.NodeIndex;
    childRelations: TT.ChildRelations;
}

const SELECT_LIST_COMPONENT: React.SFC<Props> = (
    {
        selectedIds,
        hiddenSubTreeIds,
        nodeIndex,
        childRelations,
    }: Props
) => {
    const skipSubtree = (id: number) => hiddenSubTreeIds.includes(id);

    const toDo: TU.treeReducer<JSX.Element[]> = (entries, currentId) => {
        const e = nodeIndex[currentId];
        const isSelected = selectedIds.includes(e.id);

        switch (e.type) {
            case TT.NodeTypes.GROUP:
            case TT.NodeTypes.DRAWABLE_GROUP:
            case TT.NodeTypes.FILLING_GROUP:
                entries.unshift((
                    <GROUP_ENTRY 
                        id={e.id} 
                        childRelations={childRelations} 
                        childrenSelected={TU
                            .getAncestors(childRelations, {subRootId: e.id})
                            .some(id => selectedIds.includes(id))
                        }
                    />
                ));
                break;
            case TT.NodeTypes.DRAWABLE:
                entries.unshift(
                    <DRAWABLE_ENTRY
                        id={e.id}
                        isSelected={isSelected}
                        drawable={e as TT.DrawableNode}
                    />
                );
                break;
            default:
            console.error(`Unknown Node Type ${e.type}`);
        }

        return entries;
    };

    return (

        <div>
            {TU.reduceDepthFirst(0, toDo, childRelations, [], { skipSubtree })}
        </div>
    );
};

export const SELECT_LIST = ReactRedux.connect(
    stateToProps
)(SELECT_LIST_COMPONENT);

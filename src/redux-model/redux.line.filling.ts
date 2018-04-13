import * as Redux from 'redux';
import { ReduxState } from './redux.state';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { createSimpleLineFilling } from '../data-model/svg.line.filling';
import { Context } from '../data-model/model.context';

export module LineFilling {
    export interface Arguments {
        id: number;
        angle: number;
        spacing: number;
        offset: number;
    }

    export interface Action extends Redux.Action, Arguments {}

    export const TYPE = 'LINE_FILLING';

    export function action({id, angle, spacing, offset}: Arguments): Action {
        return {
            type: TYPE,
            id,
            angle,
            spacing,
            offset,
        };
    }

    export function reduce(state: ReduxState, rAction: Redux.Action): ReduxState {
        const fillAction = rAction as Action;

        if (state.nodeIndex[fillAction.id].type !== TT.NodeTypes.DRAWABLE) { return state; }

        const filledDrawable = state.nodeIndex[fillAction.id] as TT.DrawableNode;

        const lineDrawables = createSimpleLineFilling(
            filledDrawable,
            fillAction.angle,
            fillAction.spacing,
            fillAction.offset,
            state.dimensions
        );

        if (lineDrawables.length === 0) { return state; }

        let parentId = state.parentRelations[fillAction.id];
        const parentType = state.nodeIndex[parentId].type;
        const fillingGroup = TT.newFillingGroupNode();
        const newContext = new Context(state);

        if (parentType !== TT.NodeTypes.DRAWABLE_GROUP) {
            const drawableGroup = TT.newDrawableGroupNode();

            newContext.add(parentId, drawableGroup);
            newContext.relate(drawableGroup.id, filledDrawable.id);
            parentId = drawableGroup.id;
        }

        newContext.add(parentId, fillingGroup);
        newContext.add(fillingGroup.id, ...lineDrawables);
        newContext.move(filledDrawable.id, 1);

        const newTree = newContext.pull();
        return {
            ...state,
            dimensions: newTree.dimensions,
            nodeIndex: newTree.nodeIndex,
            parentRelations: newTree.relations.parentRelations,
            childRelations: newTree.relations.childRelations,
        };
    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
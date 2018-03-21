import * as Redux from 'redux';
import { ReduxState } from './redux.state';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { createSimpleLineFilling } from '../data-model/svg.line.filling';
import { Context } from '../data-model/model.context';

export module LineFilling {
    // export interface StateExtension {
    //     clippedGraph: GT.Graph;
    // }

    // export const initialStateExtension: StateExtension = { clippedGraph: null };

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

        if (state.elementIndex[fillAction.id].type !== GT.Types.DRAWABLE) { return state; }

        const filledDrawable = state.elementIndex[fillAction.id] as GT.DrawableElement;

        const lineDrawables = createSimpleLineFilling(
            filledDrawable,
            fillAction.angle,
            fillAction.spacing,
            fillAction.offset,
            state.dimensions
        );

        if (lineDrawables.length === 0) { return state; }

        const fillingGroup = GT.newGroupElement();
        const newContext = new Context(state);

        newContext.add(filledDrawable.id, fillingGroup);
        newContext.add(fillingGroup.id, ...lineDrawables);

        const newGraph = newContext.pull();
        console.log(lineDrawables, newGraph);
        return {
            ...state,
            dimensions: newGraph.dimensions,
            elementIndex: newGraph.elementIndex,
            parentRelations: newGraph.relations.parentRelations,
            childRelations: newGraph.relations.childRelations,
        };
    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
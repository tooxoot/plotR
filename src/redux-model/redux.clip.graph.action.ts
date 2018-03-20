import * as Redux from 'redux';
import { ReduxState } from './redux.state';
import { ClipUtils } from '../data-model/svg.clipping';
import { GraphUtils as GU } from '../data-model/model.graph.utils';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { Context } from '../data-model/model.context';

export module ClipGraph {
    export interface StateExtension {
        clippedGraph: GT.Graph;
    }

    export const initialStateExtension: StateExtension = { clippedGraph: null };

    export const TYPE = 'CLIP_GRAPH';

    export function action(): Redux.Action {
        return {
            type: TYPE
        };
    }

    export function reduce(state: ReduxState): ReduxState {
        const drawables = GU.getDrawables(state.elementIndex, state.childRelations);
        const clippedDrawables = ClipUtils.clip(drawables);
        const clippedContext = Context.createNewRoot(state.dimensions);
        clippedContext.add(0, ...clippedDrawables);
        const newClippedGraph = clippedContext.pull();

        return {
            ...state,
            clippedGraph: newClippedGraph,
        };
    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
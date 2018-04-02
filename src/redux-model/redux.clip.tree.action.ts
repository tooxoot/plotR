import * as Redux from 'redux';
import { ReduxState } from './redux.state';
import { ClipUtils } from '../data-model/svg.clipping';
import { TreeUtils as TU } from '../data-model/model.tree.utils';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { Context } from '../data-model/model.context';

export module ClipTree {
    export interface StateExtension {
        clippedTree: TT.Tree;
    }

    export const initialStateExtension: StateExtension = { clippedTree: null };

    export const TYPE = 'CLIP_TREE';

    export function action(): Redux.Action {
        return {
            type: TYPE
        };
    }

    export function reduce(state: ReduxState): ReduxState {
        const drawables = TU.getDrawables(
            state.nodeIndex,
            state.childRelations,
        );
        const clippedDrawables = ClipUtils.clip(drawables);
        const clippedContext = Context.createNewRoot(state.dimensions);
        clippedContext.add(0, ...clippedDrawables);
        const newClippedTree = clippedContext.pull();

        return {
            ...state,
            clippedTree: newClippedTree,
        };
    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
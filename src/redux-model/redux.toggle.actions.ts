import * as Redux from 'redux';
import { ReduxState, IdAction, ListAction } from './redux.state';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { TreeUtils as TU } from '../data-model/model.tree.utils';

export module NodeToggles {

    export const TYPE_SELECT = 'TOGGLE_SELECT';
    export const TYPE_SELECT_LIST = 'TOGGLE_SELECT_LIST';
    export const TYPE_HIDE_CHILDREN = 'TOGGLE_TYPE_HIDE_CHILDREN';
    export const TYPE_FILLING = 'TOGGLE_FILLING';
    export const TYPE_CLOSE = 'TOGGLE_CLOSE';

    export function actionSelect(toggledId: number): IdAction {
        return {
            type: TYPE_SELECT,
            id: toggledId,
        };
    }
    
    export function actionSelectList(toggledIds: number[]): ListAction {
        return {
            type: TYPE_SELECT_LIST,
            ids: toggledIds,
        };
    }

    export function actionHideChildren(toggledId: number): IdAction {
        return {
            type: TYPE_HIDE_CHILDREN,
            id: toggledId,
        };
    }

    export function actionFilling(toggledId: number): IdAction {
        return {
            type: TYPE_FILLING,
            id: toggledId,
        };
    }

    export function actionClose(toggledId: number): IdAction {
        return {
            type: TYPE_CLOSE,
            id: toggledId,
        };
    }

    export function reduceSelect(state: ReduxState, action: Redux.Action): ReduxState {
        const toggledId = (action as IdAction).id;
        let newSelectedIds: number[];

        if (state.selectedIds.includes(toggledId)) {
            newSelectedIds = state.selectedIds.filter(id => id !== toggledId);
        } else {
            newSelectedIds = state.selectedIds.concat(toggledId);
        }

        return {
            ...state,
            selectedIds: newSelectedIds
        };
    }

    export function reduceSelectList(state: ReduxState, reduxAction: Redux.Action): ReduxState {
        const toggledIds = (reduxAction as ListAction).ids;
        let newSelectedIds: number[];

        if (toggledIds.some(id => state.selectedIds.includes(id))) {
            newSelectedIds = state.selectedIds.filter(id => !toggledIds.includes(id));
        } else {
            newSelectedIds = state.selectedIds.concat(toggledIds);
        }

        return {
            ...state,
            selectedIds: newSelectedIds
        };
    }

    export function reduceHideChildren(state: ReduxState, action: Redux.Action): ReduxState {
        const toggledId = (action as IdAction).id;
        let newHiddenSubTreeIds: number[];
        let newSelectedIds: number[];

        if (state.hiddenSubTreeIds.includes(toggledId)) {
            newHiddenSubTreeIds = state.hiddenSubTreeIds.filter(id => id !== toggledId);
        } else {
            newHiddenSubTreeIds = state.hiddenSubTreeIds.concat(toggledId);
            const ancestors = TU.getAncestors(state.childRelations, {subRootId: toggledId});
            newSelectedIds = state.selectedIds.filter(id => !ancestors.includes(id));
        }
        return {
            ...state,
            hiddenSubTreeIds: newHiddenSubTreeIds,
            selectedIds: newSelectedIds ? newSelectedIds : state.selectedIds,
        };
    }

    export function reduceFilling(state: ReduxState, action: Redux.Action): ReduxState {
        return reduceToggleDrawableFlag(state, (action as IdAction).id, 'filled');
    }

    export function reduceClose(state: ReduxState, action: Redux.Action): ReduxState {
        return reduceToggleDrawableFlag(state, (action as IdAction).id, 'closed');
    }

    export const reducerMap = {
        [TYPE_SELECT]: reduceSelect,
        [TYPE_SELECT_LIST]: reduceSelectList,
        [TYPE_HIDE_CHILDREN]: reduceHideChildren,
        [TYPE_FILLING]: reduceFilling,
        [TYPE_CLOSE]: reduceClose,
    };

    function reduceToggleDrawableFlag(state: ReduxState, id: number, key: string): ReduxState {
        const node = state.nodeIndex[id];

        if ( node.type !== TT.NodeTypes.DRAWABLE) { return state; }

        let drawable = node as TT.DrawableNode;
        drawable = {
            ...drawable,
            [key]: !drawable[key]
        };

        return {
            ...state,
            nodeIndex: {
                ...state.nodeIndex,
                [id]: drawable,
            }
        };
    }
}

import * as Redux from 'redux';
import { ReduxState, IdAction } from './redux.state';
import { GraphTypes as GT } from '../data-model/model.graph.types';

export module ElementToggles {

    export const TYPE_SELECT = 'TOGGLE_SELECT';
    export const TYPE_FILLING = 'TOGGLE_FILLING';
    export const TYPE_CLOSE = 'TOGGLE_CLOSE';

    export function actionSelect(toggledId: number): IdAction {
        return {
            type: TYPE_SELECT,
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

    export function reduceFilling(state: ReduxState, action: Redux.Action): ReduxState {
        return reduceToggleDrawableFlag(state, (action as IdAction).id, 'filled');
    }

    export function reduceClose(state: ReduxState, action: Redux.Action): ReduxState {
        return reduceToggleDrawableFlag(state, (action as IdAction).id, 'closed');
    }

    export const reducerMap = {
        [TYPE_SELECT]: reduceSelect,
        [TYPE_FILLING]: reduceFilling,
        [TYPE_CLOSE]: reduceClose,
    };

    function reduceToggleDrawableFlag(state: ReduxState, id: number, key: string): ReduxState {
        const element = state.elementIndex[id];

        if ( element.type !== GT.Types.DRAWABLE) { return state; }

        let drawable = element as GT.DrawableElement;
        drawable = {
            ...drawable,
            [key]: !drawable[key]
        };

        return {
            ...state,
            elementIndex: {
                ...state.elementIndex,
                [id]: drawable,
            }
        };
    }
}

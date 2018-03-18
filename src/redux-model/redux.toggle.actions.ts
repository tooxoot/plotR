import * as Redux from 'redux';
import { ReduxState } from './redux.state';
import { GraphTypes as GT } from '../data-model/model.graph.types';

export interface ToggleSelect extends Redux.Action {
    id: number;
}
export const TOGGLE_SELECT_MODEL_ELEMENT = 'TOGGLE_SELECT_MODEL_ELEMENT';

export function toggleSelect(modelElementId: number): ToggleSelect {
    return {
        type: TOGGLE_SELECT_MODEL_ELEMENT,
        id: modelElementId
    };
}

export function reduceToggleSelect(state: ReduxState, toggle: ToggleSelect): ReduxState {
    let toggledIds: number[];

    if (state.selectedIds.includes(toggle.id)) {
        toggledIds = state.selectedIds.filter(id => id !== toggle.id);
    } else {
        toggledIds = state.selectedIds.concat(toggle.id);
    }

    return {
        ...state,
        selectedIds: toggledIds
    };
}

export interface ToggleFilling extends Redux.Action {
    id: number;
}
export const TOGGLE_FILLING_MODEL_ELEMENT = 'TOGGLE_FILLING_MODEL_ELEMENT';

export function toggleFilling(modelElementId: number): ToggleFilling {
    return {
        type: TOGGLE_FILLING_MODEL_ELEMENT,
        id: modelElementId
    };
}

export function reduceToggleFilling(state: ReduxState, toggle: ToggleFilling): ReduxState {
    return reduceToggleDrawableFlag(state, toggle.id, 'filled');
}

export interface ToggleClose extends Redux.Action {
    id: number;
}
export const TOGGLE_CLOSE_MODEL_ELEMENT = 'TOGGLE_CLOSE_MODEL_ELEMENT';

export function toggleClose(modelElementId: number): ToggleClose {
    return {
        type: TOGGLE_CLOSE_MODEL_ELEMENT,
        id: modelElementId
    };
}

export function reduceToggleClose(state: ReduxState, toggle: ToggleClose): ReduxState {
    return reduceToggleDrawableFlag(state, toggle.id, 'closed');
}

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

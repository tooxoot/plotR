import * as Redux from 'redux';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import * as ToggleActions from './redux.toggle.actions';
import * as ProcessAction from './redux.process.action';

export interface ReduxState {
    selectedIds: number[];
    triggerUpdate: boolean;
    elementIndex: GT.ElementIndex;
    parentRelations: GT.ParentRelations;
    childRelations: GT.ChildRelations;
    svgSource: HTMLElement;
}

const initialState: ReduxState = {
    selectedIds: [],
    triggerUpdate: false,
    elementIndex: {},
    parentRelations: {},
    childRelations: {},
    svgSource: document.getElementById('SVG'),
};

export interface IdAction extends Redux.Action {
    id: number;
}

const SELECT_MODEL_ELEMENT = 'SELECT_MODEL_ELEMENT';

const DESELECT_MODEL_ELEMENT = 'DESELECT_MODEL_ELEMENT';

export function selectId(modelElementId: number): IdAction {
    return {
        type: SELECT_MODEL_ELEMENT,
        id: modelElementId
    };
}

export function deselectId(modelElementId: number): IdAction {
    return {
        type: DESELECT_MODEL_ELEMENT,
        id: modelElementId
    };
}

function mainReducer ( state: ReduxState, action: Redux.Action): ReduxState {
    switch (action.type) {
        case SELECT_MODEL_ELEMENT:
            const select = action as IdAction;
            return {
                ...state,
                selectedIds: state.selectedIds.concat(select.id)
            };

        case DESELECT_MODEL_ELEMENT:
            const deselect = action as IdAction;
            return {
                ...state,
                selectedIds: state.selectedIds.filter(id => id !== deselect.id)
            };

        case ProcessAction.PROCESS_SVG_SOURCE:
            return ProcessAction.reduceToggleSelect(state);

        case ToggleActions.TOGGLE_CLOSE_MODEL_ELEMENT:
            return ToggleActions.reduceToggleClose(state, action as ToggleActions.ToggleClose);

        case ToggleActions.TOGGLE_FILLING_MODEL_ELEMENT:
            return {
                ...ToggleActions.reduceToggleFilling(state, action as ToggleActions.ToggleFilling),
                triggerUpdate: !state.triggerUpdate
            };

        case ToggleActions.TOGGLE_SELECT_MODEL_ELEMENT:
            return ToggleActions.reduceToggleSelect(state, action as ToggleActions.ToggleSelect);

        default:
            return state;
    }
}

export const RSTORE = Redux.createStore<ReduxState>(mainReducer, initialState);
import * as Redux from 'redux';
import { ReduxState } from './redux.state';

export module ToggleDebugView {

    export interface StateExtension {
        showDebugView: boolean;
    }

    export const initialStateExtension: StateExtension = {
        showDebugView: false,
    };

    export const TYPE = 'TOGGLE_DEBUG_VIEW';

    export function action(): Redux.Action {
        return {
            type: TYPE
        };
    }

    export function reduce(state: ReduxState): ReduxState {
        return {
            ...state,
            showDebugView: !state.showDebugView,
        };
    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
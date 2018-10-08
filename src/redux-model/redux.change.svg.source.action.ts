import * as Redux from 'redux';
import { ReduxState } from './redux.state';

export module ChangeSvgSource {
    export interface Arguments {
        svg: HTMLElement;
    }

    export interface Action extends Redux.Action, Arguments {}

    export const TYPE = 'IMPORT_SVG_SOURCE';

    export function action(svg: HTMLElement): Action {
        return {
            type: TYPE,
            svg,
        };
    }

    export function reduce(state: ReduxState, rAction: Redux.Action): ReduxState {
        return {
            ...state,
            svgSource: (rAction as Action).svg || state.svgSource,
        };

    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
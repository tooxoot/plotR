import * as Redux from 'redux';
import { GraphTypes as GT } from '../data-model/model.graph.types';
import { ElementToggles } from './redux.toggle.actions';
import { ProcessSvgSource } from './redux.process.action';
import { ToggleDebugView } from './redux.debug.view.actions';
import { ClipGraph } from './redux.clip.graph.action';

export interface ReduxState extends
    ToggleDebugView.StateExtension,
    ClipGraph.StateExtension {
    selectedIds: number[];
    dimensions: GT.Dimensions;
    elementIndex: GT.ElementIndex;
    parentRelations: GT.ParentRelations;
    childRelations: GT.ChildRelations;
    svgSource: HTMLElement;
}

const initialState: ReduxState = {
    selectedIds: [],
    dimensions: null,
    elementIndex: {},
    parentRelations: {},
    childRelations: {},
    svgSource: document.getElementById('SVG'),
    ...ToggleDebugView.initialStateExtension,
    ...ClipGraph.initialStateExtension,
};

const reducerMap: {[type: string]: (state: ReduxState, action: Redux.Action) => ReduxState} = {
    ...ProcessSvgSource.reducerMap,
    ...ToggleDebugView.reducerMap,
    ...ClipGraph.reducerMap,
    ...ElementToggles.reducerMap,
};

export interface IdAction extends Redux.Action {
    id: number;
}

function mainReducer ( state: ReduxState, action: Redux.Action): ReduxState {
    if (!reducerMap[action.type]) {
        console.error(`redux.state.ts: Unknown action type ${action.type}!`);
        return state;
    }

    return reducerMap[action.type](state, action);
}

export const RSTORE = Redux.createStore<ReduxState>(mainReducer, initialState);
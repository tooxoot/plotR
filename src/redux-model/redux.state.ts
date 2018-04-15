import * as Redux from 'redux';
import { TreeTypes as TT } from '../data-model/model.tree.types';
import { NodeToggles } from './redux.toggle.actions';
import { ProcessSvgSource } from './redux.process.action';
import { ToggleDebugView } from './redux.debug.view.actions';
import { ClipTree } from './redux.clip.tree.action';
import { LineFilling } from './redux.line.filling';

export interface ReduxState extends
    ToggleDebugView.StateExtension,
    ClipTree.StateExtension {
    selectedIds: number[];
    hiddenSubTreeIds: number [];
    dimensions: TT.Dimensions;
    nodeIndex: TT.NodeIndex;
    parentRelations: TT.ParentRelations;
    childRelations: TT.ChildRelations;
    svgSource: HTMLElement;
}

const initialState: ReduxState = {
    selectedIds: [],
    hiddenSubTreeIds: [],    
    dimensions: null,
    nodeIndex: {},
    parentRelations: {},
    childRelations: {},
    svgSource: document.getElementById('SVG'),
    ...ToggleDebugView.initialStateExtension,
    ...ClipTree.initialStateExtension,
};

const reducerMap: {[type: string]: (state: ReduxState, action: Redux.Action) => ReduxState} = {
    ...ProcessSvgSource.reducerMap,
    ...ToggleDebugView.reducerMap,
    ...ClipTree.reducerMap,
    ...NodeToggles.reducerMap,
    ...LineFilling.reducerMap,
};

export interface IdAction extends Redux.Action {
    id: number;
}

export interface ListAction extends Redux.Action {
    ids: number[];
}

function mainReducer ( state: ReduxState, action: Redux.Action): ReduxState {
    if (!reducerMap[action.type]) {
        console.error(`redux.state.ts: Unknown action type ${action.type}!`);
        return state;
    }

    return reducerMap[action.type](state, action);
}

export const RSTORE = Redux.createStore<ReduxState>(mainReducer, initialState);
import * as Redux from 'redux';
import { ReduxState } from './redux.state';
import { processSVG } from '../svg-import/svg.input.processor';

export const PROCESS_SVG_SOURCE = 'PROCESS_SVG_SOURCE';

export function processSVGSource(): Redux.Action {
    return {
        type: PROCESS_SVG_SOURCE
    };
}

export function reduceToggleSelect(state: ReduxState): ReduxState {
    const graph = processSVG(state.svgSource);

    console.log(graph);

    return {
        ...state,
        selectedIds: [],
        elementIndex: graph.elementIndex,
        parentRelations: graph.relations.parentRelations,
        childRelations: graph.relations.childRelations,
    };

}

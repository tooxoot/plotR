import * as Redux from 'redux';
import { ReduxState } from './redux.state';
import { processSVG } from '../svg-import/svg.input.processor';

export module ProcessSvgSource {
    export const TYPE = 'PROCESS_SVG_SOURCE';

    export function action(): Redux.Action {
        return {
            type: TYPE
        };
    }

    export function reduce(state: ReduxState): ReduxState {
        const graph = processSVG(state.svgSource);

        console.log(graph);

        return {
            ...state,
            selectedIds: [],
            dimensions: graph.dimensions,
            elementIndex: graph.elementIndex,
            parentRelations: graph.relations.parentRelations,
            childRelations: graph.relations.childRelations,
        };

    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
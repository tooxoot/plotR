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
        const tree = processSVG(state.svgSource);

        console.log(tree);

        return {
            ...state,
            selectedIds: [],
            dimensions: tree.dimensions,
            nodeIndex: tree.nodeIndex,
            parentRelations: tree.relations.parentRelations,
            childRelations: tree.relations.childRelations,
        };

    }

    export const reducerMap = {
        [TYPE]: reduce,
    };
}
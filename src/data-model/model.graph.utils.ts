import { GraphTypes as GT } from './model.graph.types';

export module GraphUtils {
    export const BREADTH = 'breadth';
    export const DEPTH = 'depth';
    export type Priority = 'breadth' | 'depth';

    export function relate(
        parentId: number,
        childId: number,
        {parentRelations, childRelations}: GT.Relations,
        createNewRelations: boolean = true,
    ): GT.Relations {

        const newPRs: GT.ParentRelations = createNewRelations ? {...parentRelations} : parentRelations;
        const newCRs: GT.ChildRelations = createNewRelations ? {...childRelations} : childRelations;
        const oldParentId = newPRs[childId];

        if (oldParentId) {
            newCRs[oldParentId] = newCRs[oldParentId].filter(id => id !== childId);
        }

        newPRs[childId] = parentId;

        newCRs[parentId] = newCRs[parentId].concat(childId);

        return {
            parentRelations: newPRs,
            childRelations: newCRs
        };
    }

    export function getAncestors(
        childRelations: GT.ChildRelations,
        {
            subRootId = 0,
            priority = DEPTH,
            selector
        }: {
            subRootId?: number,
            priority?: Priority,
            selector?: (id: number) => boolean;
        } = {}
    ): number[] {
        const toDo = (reducedResults: number[], currentId: number) => {
            if (!selector || selector(currentId)) {
                reducedResults.push(currentId);
            }
            return reducedResults;
        };
        return reduceTree<number>(subRootId, toDo, childRelations, priority);
    }

    export function getDrawables(
        elementIndex: GT.ElementIndex,
        childRelations: GT.ChildRelations,
        {
            subRootId = 0,
            priority = DEPTH,
            selector,
        }: {
            subRootId?: number,
            priority?: Priority,
            selector?: (id: number) => boolean;
        } = {}
    ): GT.DrawableElement[] {
        const drawableSelector = (id: number) => (
            elementIndex[id].type === GT.Types.DRAWABLE &&
            (!selector || selector(id))
        );
        return getAncestors(
            childRelations,
            { subRootId, priority, selector: drawableSelector }
        ).map(id => elementIndex[id] as GT.DrawableElement);
    }

    export function reduceTree<T>(
        subRootId: number,
        toDo: (reducedResults: T[], currentId: number, index?: number, arr?: number[]) => T[],
        childRelations: GT.ChildRelations,
        priority: Priority = DEPTH,
    ): T[] {
        if ( priority === BREADTH) {
            return reduceBreadthFirst(subRootId, toDo, childRelations);
        }
        return reduceDepthFirst(subRootId, toDo, childRelations);
    }

    export function reduceDepthFirst<T>(
        subRootId: number,
        toDo: (reducedResults: T[], currentId: number, index?: number, arr?: number[]) => T[],
        childRelations: GT.ChildRelations,
    ): T[] {
        if (!childRelations[subRootId]) { return []; }

        const results: T[] = [];
        results.push(
            ...childRelations[subRootId].reduce(
                (subResult, currentId, subIndex, subArr) => {
                    subResult.push(...reduceTree(currentId, toDo, childRelations));
                    return subResult;
                },
                []
            )
        );

        results.push(
            ...childRelations[subRootId].reduce(
                toDo,
                []
            )
        );

        return results;
    }

    export function reduceBreadthFirst<T>(
        subRootId: number,
        toDo: (reducedResults: T[], currentId: number, index?: number, arr?: number[]) => T[],
        childRelations: GT.ChildRelations,
    ): T[] {
        const results: T[] = [];
        let currentLayer: number[] = childRelations[subRootId];

        while (currentLayer.length > 0) {
            results.push(...currentLayer.reduce(toDo, []));
            currentLayer = currentLayer.reduce(
                (newLayer, currentId) => {
                    newLayer.push(...childRelations[currentId]);
                    return newLayer;
                },
                [] as number[]
            );
        }

        return results;
    }

    export function getAncestorsBreadthFirst(
        subRootId: number,
        childRelations: GT.ChildRelations,
        ...id: number[]
    ): number[] {

        return null;
    }
}
import { GraphTypes as GT } from './model.graph.types';

export module GraphUtils {
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
        subRootId: number,
        childRelations: GT.ChildRelations,
        ...ids: number[]
    ): number[] {
        const toDo = (reducedResults: number[], currentId: number) => {
            if (ids.length === 0 || ids.includes(currentId)) {
                reducedResults.push(currentId);
            }
            return reducedResults;
        };
        return reduceTree<number>(subRootId, toDo, childRelations);
    }

    export function getDrawables(
        elementIndex: GT.ElementIndex,
        childRelations: GT.ChildRelations
    ): GT.DrawableElement[] {
        const toDo = (results: GT.DrawableElement[], currentId: number) => {
            if (elementIndex[currentId].type === GT.Types.DRAWABLE) {
                results.push(elementIndex[currentId] as GT.DrawableElement);
            }
            return results;
        };
        return reduceTree(0, toDo, childRelations);
    }

    export function reduceTree<T>(
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
}
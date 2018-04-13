import { TreeTypes as TT } from './model.tree.types';

export module TreeUtils {
    export const BREADTH = 'breadth';
    export const DEPTH = 'depth';
    export type Priority = 'breadth' | 'depth';
    export type treeReducer<T> = (reducedResult: T, currentId: number, index?: number, arr?: number[]) => T;

    export function move(
        childId: number,
        direction: 1 | -1 |  'DOWN' | 'UP',
        {parentRelations, childRelations}: TT.Relations,
        createNewRelations: boolean = true,
    ): TT.Relations {
        const newPRs: TT.ParentRelations = createNewRelations ? {...parentRelations} : parentRelations;
        const newCRs: TT.ChildRelations = createNewRelations ? {...childRelations} : childRelations;
        const parentId = newPRs[childId];
        const oldPosition = newCRs[parentId].findIndex(id => id === childId);

        const step =
            direction === 1 || direction === -1 ? direction :
            direction === 'UP' ? 1 :
            direction === 'DOWN' ? -1 :
            0;

        newCRs[parentId] = newCRs[parentId].filter(id => id !== childId);
        newCRs[parentId].splice((oldPosition % newCRs[parentId].length) + step , 0, childId);

        return {
            parentRelations: newPRs,
            childRelations: newCRs
        };
    }

    export function relate(
        parentId: number,
        childId: number,
        {parentRelations, childRelations}: TT.Relations,
        createNewRelations: boolean = true,
    ): TT.Relations {
        const newPRs: TT.ParentRelations = createNewRelations ? {...parentRelations} : parentRelations;
        const newCRs: TT.ChildRelations = createNewRelations ? {...childRelations} : childRelations;
        const oldParentId = newPRs[childId];

        if (oldParentId || oldParentId === 0) {
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
        childRelations: TT.ChildRelations,
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
        return reduceTree(subRootId, toDo, childRelations, priority, [] as number[]);
    }

    export function getDrawables(
        nodeIndex: TT.NodeIndex,
        childRelations: TT.ChildRelations,
        {
            subRootId = 0,
            priority = DEPTH,
            selector,
        }: {
            subRootId?: number,
            priority?: Priority,
            selector?: (id: number) => boolean;
        } = {}
    ): TT.DrawableNode[] {
        const drawableSelector = (id: number) => (
            nodeIndex[id].type === TT.NodeTypes.DRAWABLE &&
            (!selector || selector(id))
        );
        return getAncestors(
            childRelations,
            { subRootId, priority, selector: drawableSelector }
        ).map(id => nodeIndex[id] as TT.DrawableNode);
    }

    export function reduceTree<T>(
        subRootId: number,
        toDo: treeReducer<T>,
        childRelations: TT.ChildRelations,
        priority: Priority = DEPTH,
        initialValue: T,
    ): T {
        if ( priority === BREADTH) {
            return reduceBreadthFirst(subRootId, toDo, childRelations, initialValue);
        }
        return reduceDepthFirst(subRootId, toDo, childRelations, initialValue);
    }

    export function reduceDepthFirst<T>(
        subRootId: number,
        toDo: treeReducer<T>,
        childRelations: TT.ChildRelations,
        initialValue: T,
    ): T {
        if (!childRelations[subRootId]) { return null; }

        return childRelations[subRootId].reduce(
            (subResult, currentId, subIndex, subArr) => {
                reduceDepthFirst(currentId, toDo, childRelations, initialValue);
                toDo(subResult, currentId, subIndex, subArr);
                return subResult;
            },
            initialValue
        );
    }

    export function reduceBreadthFirst<T>(
        subRootId: number,
        toDo: treeReducer<T>,
        childRelations: TT.ChildRelations,
        initialValue: T,
    ): T {
        let currentLayer: number[] = childRelations[subRootId];
        let result = initialValue;

        while (currentLayer.length > 0) {
            result = currentLayer.reduce(toDo, result);
            currentLayer = currentLayer.reduce(
                (newLayer, currentId) => {
                    newLayer.push(...childRelations[currentId]);
                    return newLayer;
                },
                [] as number[]
            );
        }

        return result;
    }

    export function getAncestorsBreadthFirst(
        subRootId: number,
        childRelations: TT.ChildRelations,
        ...id: number[]
    ): number[] {

        return null;
    }
}
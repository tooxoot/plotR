import { TreeTypes as TT } from './model.tree.types';
import { TreeUtils as TU } from './model.tree.utils';

export class Context {
    private dimensions: TT.Dimensions;
    private parentRelations: TT.ParentRelations;
    private childRelations: TT.ChildRelations;
    private nodeIndex: TT.NodeIndex;
    private tree: TT.Tree;

    public static createNewRoot({X, Y}: {X: number, Y: number}): Context {
        return new Context({
            dimensions: { X: X, Y: Y, center: {X: X / 2, Y: Y / 2}},
            parentRelations: { 0: -1 },
            childRelations: { 0: [] },
            nodeIndex: { 0: { id: 0, type: TT.NodeTypes.ROOT } },
        });
    }

    constructor ({dimensions, parentRelations, childRelations, nodeIndex}: {
        dimensions: TT.Dimensions,
        parentRelations: TT.ParentRelations,
        childRelations: TT.ChildRelations,
        nodeIndex: TT.NodeIndex,
    }
    ) {
        this.dimensions = {...dimensions};
        this.parentRelations = {...parentRelations};
        this.childRelations = {...childRelations};
        this.nodeIndex = {...nodeIndex};
        this.tree = {
            dimensions: this.dimensions,
            nodeIndex: this.nodeIndex,
            relations: {
                parentRelations: this.parentRelations,
                childRelations: this.childRelations,
            },
        };
    }
    
    public add(parentId: number, ...genericNodes: TT.GenericNode[]) {
        genericNodes.forEach(gE => this.nodeIndex[gE.id] = gE);
        genericNodes.forEach(gE => this.childRelations[gE.id] = []);
        genericNodes.forEach(gE => this.relate(parentId, gE.id));
    }

    public addInfront(nodeId: number, ...genericNodes: TT.GenericNode[]) {
        const parentId = this.parentRelations[nodeId];
        const relations = [...this.childRelations[parentId]];
        const nodePosition = relations.findIndex(id => id === nodeId);
        const addedIds = genericNodes.map(gN => gN.id);
        
        this.add(parentId, ...genericNodes);
        relations.splice(nodePosition, 0, ...addedIds);

        this.childRelations[parentId] = relations;
    }

    public get(...ids: number[]): TT.GenericNode[] {
        return ids.map(id => this.nodeIndex[id]);
    }

    public move(childId: number, direction: 1 | -1 |  'DOWN' | 'UP' ) {
        TU.move(childId, direction, this.tree.relations, false);
    }

    public relate(parentId: number, childId: number) {
        TU.relate(parentId, childId, this.tree.relations, false);
    }

    public getAncestors( { subRootId = 0, priority = TU.DEPTH, selector }: {
            subRootId?: number,
            priority?: TU.Priority,
            selector?: (id: number) => boolean;
    } = {}): number[] {
        return TU.getAncestors(this.childRelations, {subRootId, priority, selector});
    }

    public getDrawables( { subRootId = 0, priority = TU.DEPTH, selector }: {
            subRootId?: number,
            priority?: TU.Priority,
            selector?: (id: number) => boolean;
    } = {}): TT.DrawableNode[] {
        return TU.getDrawables(this.nodeIndex, this.childRelations, {subRootId, priority, selector});
    }

    public reduceTree<T>(
        subRootId: number,
        toDo: (reducedResults: T, currentId: number, index?: number, arr?: number[]) => T,
        priority: TU.Priority = TU.DEPTH,
        initialValue: T,
        { skipSubtree }: {
            skipSubtree?: (id: number) => boolean
        } = {}
    ): T {
        return TU.reduceTree<T>(subRootId, toDo, this.childRelations, priority, initialValue, {skipSubtree});
    }

    public pull(): TT.Tree {
        this.lock();
        return this.tree;
    }

    public lock() {
        this.add = null;
        this.relate = null;
        this.reduceTree = null;
    }

}

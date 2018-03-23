import { GraphTypes as GT } from './model.graph.types';
import { GraphUtils as GU } from './model.graph.utils';

export class Context {
    private dimensions: GT.Dimensions;
    private parentRelations: GT.ParentRelations;
    private childRelations: GT.ChildRelations;
    private elementIndex: GT.ElementIndex;
    private graph: GT.Graph;

    public static createNewRoot({X, Y}: {X: number, Y: number}): Context {
        return new Context({
            dimensions: { X: X, Y: Y, center: {X: X / 2, Y: Y / 2}},
            parentRelations: { 0: -1 },
            childRelations: { 0: [] },
            elementIndex: { 0: { id: 0, type: GT.Types.ROOT } },
        });
    }

    constructor ({dimensions, parentRelations, childRelations, elementIndex}: {
        dimensions: GT.Dimensions,
        parentRelations: GT.ParentRelations,
        childRelations: GT.ChildRelations,
        elementIndex: GT.ElementIndex,
    }
    ) {
        this.dimensions = {...dimensions};
        this.parentRelations = {...parentRelations};
        this.childRelations = {...childRelations};
        this.elementIndex = {...elementIndex};
        this.graph = {
            dimensions: this.dimensions,
            elementIndex: this.elementIndex,
            relations: {
                parentRelations: this.parentRelations,
                childRelations: this.childRelations,
            },
        };
    }

    public add(parentId: number, ...genericElements: GT.GenericElement[]) {
        genericElements.forEach(gE => this.elementIndex[gE.id] = gE);
        genericElements.forEach(gE => this.childRelations[gE.id] = []);
        genericElements.forEach(gE => this.relate(parentId, gE.id));
    }

    public get(...ids: number[]): GT.GenericElement[] {
        return ids.map(id => this.elementIndex[id]);
    }

    public relate(parentId: number, childId: number) {
        GU.relate(parentId, childId, this.graph.relations, false);
    }

    public getAncestors( { subRootId = 0, priority = GU.DEPTH, selector }: {
            subRootId?: number,
            priority?: GU.Priority,
            selector?: (id: number) => boolean;
    } = {}): number[] {
        return GU.getAncestors(this.childRelations, {subRootId, priority, selector});
    }

    public getDrawables( { subRootId = 0, priority = GU.DEPTH, selector }: {
            subRootId?: number,
            priority?: GU.Priority,
            selector?: (id: number) => boolean;
    } = {}): GT.DrawableElement[] {
        return GU.getDrawables(this.elementIndex, this.childRelations, {subRootId, priority, selector});
    }

    public reduceTree<T>(
        subRootId: number,
        toDo: (reducedResults: T, currentId: number, index?: number, arr?: number[]) => T,
        priority: GU.Priority = GU.DEPTH,
        initialValue: T
    ): T {
        return GU.reduceTree<T>(subRootId, toDo, this.childRelations, priority, initialValue);
    }

    public pull(): GT.Graph {
        this.lock();
        return this.graph;
    }

    public lock() {
        this.add = null;
        this.relate = null;
        this.reduceTree = null;
    }

}

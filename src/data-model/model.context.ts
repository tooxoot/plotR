import { GraphTypes as GT } from './model.graph.types';
import { GraphUtils as GU } from './model.graph.utils';

export class Context {
    private parentRelations: GT.ParentRelations;
    private childRelations: GT.ChildRelations;
    private elementIndex: GT.ElementIndex;
    private graph: GT.Graph;

    public static createNewRoot(): Context {
        return new Context(
            { 0: -1 },
            { 0: [] },
            { 0: { id: 0, type: GT.Types.ROOT } },
        );
    }

    constructor (
        parentRelations: GT.ParentRelations,
        childRelations: GT.ChildRelations,
        elementIndex: GT.ElementIndex,
    ) {
        this.parentRelations = {...parentRelations};
        this.childRelations = {...childRelations};
        this.elementIndex = {...elementIndex};
        this.graph = {
            elementIndex: this.elementIndex,
            relations: {
                parentRelations: this.parentRelations,
                childRelations: this.childRelations,
            },
        };
    }

    public add(parentId: number, ...genericElements: GT.GenericElement[]) {
        genericElements.forEach(gE => this.elementIndex[gE.id] = gE);
        genericElements.forEach(gE => this.relate(parentId, gE.id));
    }

    public get(...ids: number[]): GT.GenericElement[] {
        return ids.map(id => this.elementIndex[id]);
    }

    public relate(parentId: number, childId: number) {
        GU.relate(parentId, childId, this.graph.relations, false);
    }

    public getAncestors(
        subRootId: number,
        ...ids: number[]
    ): number[] {
        return GU.getAncestors(subRootId, this.childRelations, ...ids);
    }

    public getDrawables(): GT.DrawableElement[] {
        return GU.getDrawables(this.elementIndex, this.childRelations);
    }

    public reduceTree<T>(
        subRootId: number,
        toDo: (reducedResults: T[], currentId: number, index?: number, arr?: number[]) => T[],
    ): T[] {
        return GU.reduceTree<T>(subRootId, toDo, this.childRelations);
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

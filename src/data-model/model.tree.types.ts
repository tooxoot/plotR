import { XY, GraphicValues } from './svg.model';

export module TreeTypes {

    export module NodeTypes {
        export const ROOT = 'ROOT';
        export const GROUP = 'GROUP';
        export const DRAWABLE = 'DRAWABLE';
    }
    export type NodeType = 'ROOT' | 'GROUP' | 'DRAWABLE';

    export type Dimensions = {
         X: number;
         Y: number;
         center: XY;
    };

    export type Tree = {
        dimensions: Dimensions;
        nodeIndex: NodeIndex;
        relations: Relations;
    };

    export type NodeIndex = { [elemtId: number]: GenericNode};

    export type Relations = {
        parentRelations: ParentRelations,
        childRelations: ChildRelations
    };

    export type ParentRelations = { [nodeId: number]: number };

    export type ChildRelations = { [nodeId: number]: number[] };

    export interface GenericNode {
        readonly id: number;
        readonly type: string;
    }

    export interface DrawableProperties {
        points: XY[];
        filled: boolean;
        outlined: boolean;
        closed: boolean;
        graphicValues?: GraphicValues;
    }

    export interface DrawableNode extends GenericNode, DrawableProperties {}

    export interface GroupNode extends GenericNode {}

    let currentIdCounter: number = 1;

    export function newDrawableNode(
        drawableProps: DrawableProperties
    ): DrawableNode {
        const dE: DrawableNode = {
            id: currentIdCounter++,
            type: NodeTypes.DRAWABLE,
            ...drawableProps,
        };

        return dE;
    }

    export function newGroupNode(): GroupNode {
        return {
            id: currentIdCounter++,
            type: NodeTypes.GROUP,
        };
    }

}
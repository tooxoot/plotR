import { XY, GraphicValues } from './svg.model';

export module TreeTypes {

    export module NodeTypes {
        export const ROOT = 'ROOT';
        export const GROUP = 'GROUP';
        export const DRAWABLE_GROUP = 'DRAWABLE_GROUP';
        export const FILLING_GROUP = 'FILLING_GROUP';
        export const DRAWABLE = 'DRAWABLE';
    }
    export type NodeType = 'ROOT' | 'GROUP' | 'DRAWABLE' | 'FILLING_GROUP' | 'DRAWABLE_GROUP';

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

    function newNode(type: NodeType): GenericNode {
        return {
            id: currentIdCounter++,
            type,
        };
    }

    export function newDrawableNode(
        drawableProps: DrawableProperties
    ): DrawableNode {
        const dE: DrawableNode = {
            ...newNode(NodeTypes.DRAWABLE),
            ...drawableProps,
        };

        return dE;
    }

    export function newGroupNode(): GroupNode {
        return newNode(NodeTypes.GROUP);
    }

    export function newFillingGroupNode(): GroupNode {
        return newNode(NodeTypes.FILLING_GROUP);
    }

    export function newDrawableGroupNode(): GroupNode {
        return newNode(NodeTypes.DRAWABLE_GROUP);
    }
}
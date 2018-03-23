import { XY, GraphicValues } from './svg.model';

export module GraphTypes {

    export module Types {
        export const ROOT = 'ROOT';
        export const GROUP = 'GROUP';
        export const DRAWABLE = 'DRAWABLE';
    }
    export type Type = 'ROOT' | 'GROUP' | 'DRAWABLE';

    export type Dimensions = {
         X: number;
         Y: number;
         center: XY;
    };

    export type Graph = {
        dimensions: Dimensions;
        elementIndex: ElementIndex;
        relations: Relations;
    };

    export type ElementIndex = { [elemtId: number]: GenericElement};

    export type Relations = {
        parentRelations: ParentRelations,
        childRelations: ChildRelations
    };

    export type ParentRelations = { [elementId: number]: number };

    export type ChildRelations = { [elementId: number]: number[] };

    export interface GenericElement {
        readonly id: number;
        readonly type: string;
    }

    export interface DrawableProps {
        points: XY[];
        filled: boolean;
        outlined: boolean;
        closed: boolean;
        graphicValues?: GraphicValues;
    }

    export interface DrawableElement extends GenericElement, DrawableProps {}

    export interface GroupElement extends GenericElement {}

    let currentIdCounter: number = 1;

    export function newDrawableElement(
        drawableProps: DrawableProps
    ): DrawableElement {
        const dE: DrawableElement = {
            id: currentIdCounter++,
            type: Types.DRAWABLE,
            ...drawableProps,
        };

        return dE;
    }

    export function newGroupElement(): GroupElement {
        return {
            id: currentIdCounter++,
            type: Types.GROUP,
        };
    }

}
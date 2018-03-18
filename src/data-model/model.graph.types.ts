import { XY, GraphicValues } from './svg.model';

export module GraphTypes {

    export module Types {
        export const ELEMENT = 'ELEMENT';
        export const ROOT = 'ROOT';
        export const GROUP = 'GROUP';
        export const MODEL = 'MODEL';
        export const DRAWABLE = 'DRAWABLE';
    }

    export type Graph = {
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
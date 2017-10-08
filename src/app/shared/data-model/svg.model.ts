export interface XY {
    X: number;
    Y: number;
}

export interface GraphicValues {
    fill: string;
    stroke: string;
    strokeWidth: string;
}

export interface ModelElement {
    points: XY[];
    id: number;
    filled: boolean;
    outlined: boolean;
    closed: boolean;
    graphicValues?: GraphicValues;
}

class Model {
    readonly elements: ModelElement[] = [];

    public getElement(id: number): ModelElement {
        return this.elements.find( (e) => {
            return e.id === id
        } );
    }
}

export const MODEL = new Model();

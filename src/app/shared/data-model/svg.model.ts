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
    constructor( readonly dimensions: XY) {};

    public getElement(id: number): ModelElement {
        return this.elements.find( (e) => {
            return e.id === id
        } );
    }

    public pushAfter(id: number, ...items: ModelElement[]) {
        const i = this.elements.findIndex(e => e.id === id);
        this.elements.splice(i + 1, 0, ...items);
    }
}

export const MODEL = new Model({X: 500, Y: 500});

let modelElementCount = 0;

export function getNextId(): number {
    return modelElementCount++;
}

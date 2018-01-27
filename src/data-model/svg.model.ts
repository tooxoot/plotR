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
    filled: boolean;
    outlined: boolean;
    closed: boolean;
    graphicValues?: GraphicValues;
    id?: number;
    position?: number;
}

class Model {
    readonly elements: { [key: number]: ModelElement; } = {};
    readonly center: XY;
    private idCount = 0;

    constructor( readonly dimensions: XY) {
        this.center = {X: dimensions.X / 2, Y: dimensions.Y / 2};
    }

    public getElements(...ids: number[]): ModelElement[] {
        const returnedElements: ModelElement[] = [];

        if (ids.length === 0) {
            Object.keys(this.elements).forEach(id => returnedElements.push(this.elements[id]));
        } else {
            ids.forEach(id => returnedElements.push(this.elements[id]));
        }

        return returnedElements.sort((a, b) => a.position - b.position);
    }

    public remove(id: number): number {
        delete this.elements[id];
        return 1;
    }

    public push(...pushedElements: ModelElement[]) {
        this.pushAt(-1, ...pushedElements);
    }

    public pushAt(position: number, ...pushedElements: ModelElement[]) {
        let currentId: number;

        pushedElements.forEach(element => {
            currentId = this.nextID();
            element.id = currentId;
            element.position = position >= 0 ? position : currentId;
            this.elements[currentId] = element;
        });

    }

    private nextID(): number {
        return this.idCount++;
    }
}

export const MODEL = new Model({X: 50000, Y: 50000});

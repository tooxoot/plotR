export class ModelElement {
    constructor(
        public points: [number, number][],
        public id: string,
        public filled: boolean,
        public outlined: boolean,
        public closed: boolean
    ) {};

    public getElements(): HTMLElement[] {
         return [document.getElementById(this.id + '_FILLING'), document.getElementById(this.id + '_OUTLINE')];
    }

}

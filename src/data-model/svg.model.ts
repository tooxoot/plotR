export interface XY {
    X: number;
    Y: number;
}

export interface GraphicValues {
    fill: string;
    stroke: string;
    strokeWidth: string;
}

export module Dimensions {
    export let X: number = 0;
    export let Y: number = 0;
    export let center: XY = { X: 0, Y: 0 };

    export function set({X: width, Y: height}: XY) {
        X = width;
        Y = height;
        center = { X: width / 2, Y: height };
    }
}
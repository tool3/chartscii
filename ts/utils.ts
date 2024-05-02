import { Point } from './types';

export function getPointValue(point: Point | number): number {
    return typeof point === "number" ? point : point.value;
}

export function getPointLabel(point: Point | number): string {
    return typeof point === "number" ? point.toString() : point.label;
}
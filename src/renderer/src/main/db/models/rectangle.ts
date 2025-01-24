import { Point } from '@renderer/db/models/point';

export interface Rectangle extends Point {
    width: number;
    height: number;
}
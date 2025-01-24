import { AnswerType } from '@renderer/db/models/answer';
import { Point } from '@renderer/db/models/point';
import { Rectangle } from '@renderer/db/models/rectangle';

export interface DropzoneAnswerType {
    answer: Exclude<AnswerType, Point[][] | DropzoneAnswerType>;
    dropZone: Rectangle;
}
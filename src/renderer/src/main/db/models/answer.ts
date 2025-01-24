import { Point } from './point';
import { DropzoneAnswerType } from '@renderer/db/models/dropzone-answer-type';

export type AnswerType = string | string[] | Point[][] | DropzoneAnswerType[];

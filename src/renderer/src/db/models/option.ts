import { Point } from './point';

export interface Option {
    uuid: string;
    subjectImageArea: Point[];
    contentText?: string;
    contentRef?: string;
    explanation?: string;
}

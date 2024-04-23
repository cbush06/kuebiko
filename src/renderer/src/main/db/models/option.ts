import { Point } from './point';

export interface Option {
    uuid: string;
    subjectImageArea?: Point[];
    contentRef?: string;
    explanation?: string;
}

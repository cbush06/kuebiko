import { Point } from './point';

export interface Option {
    contentRef?: string;
    explanation?: string;
    subjectImageArea?: Point[][];
    uuid: string;
}

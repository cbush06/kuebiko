import { Point } from '@renderer/db/models/point';

export interface TestPackageOption {
    contentRef?: string;
    explanation?: string;
    subjectImageArea?: Point[][];
    uuid: string;
}

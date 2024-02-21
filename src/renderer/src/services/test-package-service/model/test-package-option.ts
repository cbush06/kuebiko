import { TestPackagePoint } from './test-package-point';

export interface TestPackageOption {
    uuid: string;
    subjectImageArea?: TestPackagePoint[];
    contentText?: string;
    contentRef?: string;
    explanation?: string;
}

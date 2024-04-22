import { TestPackagePoint } from './test-package-point';

export interface TestPackageOption {
    uuid: string;
    subjectImageArea?: TestPackagePoint[];
    contentRef?: string;
    explanation?: string;
}

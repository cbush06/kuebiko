import { TestPackageOption } from './test-package-option';
import { TestPackagePoint } from './test-package-point';

export type TestPackageQuestionType =
    | 'MULTIPLE'
    | 'MANY'
    | 'POINT'
    | 'FILL'
    | 'TEXT'
    | 'DRAGNDROP'
    | 'HOTAREA';
export type TestPackageAnswerType = string | string[] | TestPackagePoint[];

export interface TestPackageQuestion {
    uuid: string;
    type: TestPackageQuestionType;
    title: string;
    contentRef?: string;
    contentText?: string;
    subjectImageRef?: string;
    dropZones?: TestPackagePoint[];
    answer?: TestPackageAnswerType;
    options: TestPackageOption[];
    successFeedbackText?: string;
    successFeedbackRef?: string;
    failureFeedbackText?: string;
    failureFeedbackRef?: string;
    categories: string[];
}

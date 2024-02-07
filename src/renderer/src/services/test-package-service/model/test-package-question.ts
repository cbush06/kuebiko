import { TestPackageOption } from './test-package-option';
import { TestPackagePoint } from './test-package-point';

export type TestPackageQuestionType = 'MULTIPLE' | 'MANY' | 'POINT' | 'FILL' | 'SHORT' | 'LONG';
export type TestPackageAnswerType = string | string[] | TestPackagePoint | TestPackagePoint[];

export interface TestPackageQuestion {
    uuid: string;
    type: TestPackageQuestionType;
    contentRef?: string;
    contentText?: string;
    answer?: TestPackageAnswerType;
    options: TestPackageOption[];
    successFeedbackText?: string;
    successFeedbackRef?: string;
    failureFeedbackText?: string;
    failureFeedbackRef?: string;
    categories: string[];
}

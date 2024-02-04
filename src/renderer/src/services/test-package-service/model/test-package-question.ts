import { TestPackageOption } from './test-package-option';
import { TestPackagePoint } from './test-package-point';

export type TestPackageQuestionType = 'MULTIPLE' | 'MANY' | 'POINT' | 'FILL' | 'SHORT' | 'LONG';
export type TestPackageAnswerType = string | string[] | TestPackagePoint | TestPackagePoint[];

export interface TestPackageQuestion {
    uuid: string;
    type: TestPackageQuestionType;
    contentRef: string;
    answer?: TestPackageAnswerType;
    options: TestPackageOption[];
    successFeedback?: string;
    failureFeedback?: string;
    categories: string[];
}

import { TestPackageAnswerType } from './test-package-answer';
import { TestPackageOption } from './test-package-option';
import { TestPackageRectangle } from '@renderer/services/test-package-service/model/test-package-rectangle';

export type TestPackageQuestionType =
    | 'MULTIPLE'
    | 'MANY'
    | 'FILL'
    | 'TEXT'
    | 'DRAGNDROP'
    | 'HOTSPOT'
    | 'HOTAREA';

export interface TestPackageQuestion {
    uuid: string;
    type: TestPackageQuestionType;
    title: string;
    contentRef?: string;
    subjectImageRef?: string;
    dropZones?: TestPackageRectangle[];
    answer?: TestPackageAnswerType;
    options: TestPackageOption[];
    successFeedbackText?: string;
    successFeedbackRef?: string;
    failureFeedbackText?: string;
    failureFeedbackRef?: string;
    categories: string[];
}

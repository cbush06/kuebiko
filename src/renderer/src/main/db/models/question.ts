import { AnswerType } from './answer';
import { Option } from './option';
import { Point } from './point';

export type QuestionType = 'MULTIPLE' | 'MANY' | 'POINT' | 'FILL' | 'TEXT' | 'DRAGNDROP' | 'HOTAREA';

export interface Question {
    uuid: string;
    type: QuestionType;
    contentRef?: string;
    contentText?: string;
    subjectImageRef?: string;
    dropZones?: Point[];
    answer?: AnswerType;
    options: Option[];
    successFeedbackText?: string;
    successFeedbackRef?: string;
    failureFeedbackText?: string;
    failureFeedbackRef?: string;
    categories: string[];
}

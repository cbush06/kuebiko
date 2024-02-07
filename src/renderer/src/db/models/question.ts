import { AnswerType } from './answer';
import { Option } from './option';

export type QuestionType = 'MULTIPLE' | 'MANY' | 'POINT' | 'FILL' | 'SHORT' | 'LONG';

export interface Question {
    uuid: string;
    type: QuestionType;
    contentRef?: string;
    contentText?: string;
    answer?: AnswerType;
    options: Option[];
    successFeedbackText?: string;
    successFeedbackRef?: string;
    failureFeedbackText?: string;
    failureFeedbackRef?: string;
    categories: string[];
}

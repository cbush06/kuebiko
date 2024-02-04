import { AnswerType } from './answer';
import { Option } from './option';

export type QuestionType = 'MULTIPLE' | 'MANY' | 'POINT' | 'FILL' | 'SHORT' | 'LONG';

export interface Question {
    uuid: string;
    type: QuestionType;
    contentRef: string;
    answer?: AnswerType;
    options: Option[];
    successFeedback?: string;
    failureFeedback?: string;
    categories: string[];
}

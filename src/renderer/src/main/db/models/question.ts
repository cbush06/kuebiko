import { AnswerType } from './answer';
import { Option } from './option';
import { Rectangle } from '@renderer/db/models/rectangle';

export type QuestionType =
    | 'MULTIPLE'
    | 'MANY'
    | 'FILL'
    | 'TEXT'
    | 'DRAGNDROP'
    | 'HOTSPOT'
    | 'HOTAREA';

export interface Question {
    uuid: string;
    type: QuestionType;
    title: string;
    contentRef?: string;
    subjectImageRef?: string;
    dropZones?: Rectangle[];
    answer?: AnswerType;
    options: Option[];
    successFeedbackText?: string;
    successFeedbackRef?: string;
    failureFeedbackText?: string;
    failureFeedbackRef?: string;
    categories: string[];
}

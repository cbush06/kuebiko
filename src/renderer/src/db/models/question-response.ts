import { AnswerType } from './answer';

export interface QuestionResponse {
    questionRef: string;
    sectionRef: string;
    response?: AnswerType;
    credit: number;
}

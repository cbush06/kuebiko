import { QuestionResponse } from './question-response';

export type AttemptStatus = 'INPROGRESS' | 'COMPLETED';

export interface Attempt {
    uuid: string;
    testRef: string;
    started: Date;
    completed?: Date;
    status: AttemptStatus;
    score: number;
    questionResponses: QuestionResponse[];
}

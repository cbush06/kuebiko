import { DeliveryFormat } from '@renderer/store/test-delivery-store/types/delivery-format';
import { QuestionResponse } from './question-response';

export type AttemptStatus = 'INPROGRESS' | 'COMPLETED';

export interface Attempt {
    uuid: string;
    testRef: string;
    started?: Date;
    completed?: Date;
    status: AttemptStatus;
    score: number;
    questionResponses: QuestionResponse[];
    format: DeliveryFormat;
}

import { Question } from '@renderer/db/models/question';
import { AbstractDeliveryItem } from './abstract-delivery-item';
import { Test } from '@renderer/db/models/test';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { AnswerType } from '@renderer/db/models/answer';
import { getQuestionEvaluator } from '../question-evaluators/question-evaluator-factory';

export class QuestionDeliveryItem extends AbstractDeliveryItem {
    constructor(
        private test: Test,
        private question: Question,
        public response: QuestionResponse,
    ) {
        super();
    }

    get value() {
        return this.response.response;
    }

    set value(v: AnswerType | undefined) {
        this.response.response = v;
        if (v) {
            this.response.credit = getQuestionEvaluator(this.question.type).evaluate(this.question, v);
        }
    }

    getModel(): QuestionResponse {
        return this.response;
    }

    getContentRef(): string {
        return this.question.contentRef;
    }

    isRevisitable(): boolean {
        return true;
    }

    isIncludedInCount(): boolean {
        return true;
    }

    getPath(): string {
        return `/test/${this.test.uuid}/question`;
    }
}

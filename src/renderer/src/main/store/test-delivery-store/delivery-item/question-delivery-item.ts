import { AnswerType } from '@renderer/db/models/answer';
import { Option } from '@renderer/db/models/option';
import { Question, QuestionType } from '@renderer/db/models/question';
import { QuestionResponse } from '@renderer/db/models/question-response';
import { Test } from '@renderer/db/models/test';
import { getQuestionEvaluator } from '../question-evaluators/question-evaluator-factory';
import { AbstractDeliveryItem } from './abstract-delivery-item';

export class QuestionDeliveryItem extends AbstractDeliveryItem {
    private revealed = false;

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
            this.response.credit = getQuestionEvaluator(this.question.type).evaluate(
                this.question,
                v,
            );
        }
    }

    getModel(): QuestionResponse {
        return this.response;
    }

    getContentText(): string | undefined {
        return this.question.contentText;
    }

    getContentRef(): string | undefined {
        return this.question.contentRef;
    }

    getCorrectResponse(): AnswerType | undefined {
        return this.question.answer;
    }

    getType(): QuestionType {
        return this.question.type;
    }

    getSuccessFeedbackText(): string | undefined {
        return this.question.successFeedbackText;
    }

    getSuccessFeedbackRef(): string | undefined {
        return this.question.successFeedbackRef;
    }

    getFailureFeedbackText(): string | undefined {
        return this.question.failureFeedbackText;
    }

    getFailureFeedbackRef(): string | undefined {
        return this.question.failureFeedbackRef;
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

    getOptions(): Option[] {
        return this.question.options;
    }

    setRevealed(): void {
        this.revealed = true;
    }

    isRevealed(): boolean {
        return this.revealed;
    }

    getQuestionType(): QuestionType {
        return this.question.type;
    }
}

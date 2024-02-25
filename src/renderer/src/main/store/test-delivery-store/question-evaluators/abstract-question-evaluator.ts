import { AnswerType } from '@renderer/db/models/answer';

export abstract class AbstractQuestionEvaluator<V extends AnswerType, Y extends AnswerType> {
    abstract evaluate(correctResponse: V, response: V): number;

    abstract isSingleResponseCorrect(correctResponse: V, response: Y | undefined): boolean;
}

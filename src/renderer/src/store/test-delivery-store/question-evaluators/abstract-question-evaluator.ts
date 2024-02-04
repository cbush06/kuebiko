import { AnswerType } from '@renderer/db/models/answer';
import { Question } from '@renderer/db/models/question';

export abstract class AbstractQuestionEvaluator<V extends AnswerType> {
    abstract evaluate(q: Question, answer: V): number;
}

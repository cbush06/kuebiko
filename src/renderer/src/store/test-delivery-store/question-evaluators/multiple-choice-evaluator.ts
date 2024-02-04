import { Question } from '@renderer/db/models/question';
import { AbstractQuestionEvaluator } from './abstract-question-evaluator';

class MultipleChoiceEvaluator extends AbstractQuestionEvaluator<string> {
    evaluate(q: Question, answer: string): number {
        // q.answer should be the UUID of the correct Option
        // answer should be the UUID of the option chosen by the user
        return (q.answer as string) === answer ? 1 : 0;
    }
}

export const MULTIPLE_CHOICE_EVALUATOR = new MultipleChoiceEvaluator();

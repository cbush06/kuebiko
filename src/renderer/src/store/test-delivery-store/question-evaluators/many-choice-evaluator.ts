import { Question } from '@renderer/db/models/question';
import { AbstractQuestionEvaluator } from './abstract-question-evaluator';

class ManyChoiceEvaluator extends AbstractQuestionEvaluator<string[]> {
    evaluate(q: Question, answer: string[]): number {
        const correctAnswer = q.answer as string[];

        const numberCorrectlySelected = answer.filter((a) => correctAnswer.includes(a)).length;
        const numberCorrectlyUnselected = q.options.length - correctAnswer.length - (answer.length - numberCorrectlySelected);

        const valuePerOption = 1.0 / q.options.length;

        return valuePerOption * numberCorrectlySelected + valuePerOption * numberCorrectlyUnselected;
    }
}

export const MANY_CHOICE_EVALUATOR = new ManyChoiceEvaluator();

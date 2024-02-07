import { AbstractQuestionEvaluator } from './abstract-question-evaluator';

class ManyChoiceEvaluator extends AbstractQuestionEvaluator<string[], string> {
    evaluate(correctResponse: string[], response: string[]): number {
        const numberCorrectlySelected = response.filter((a) => correctResponse.includes(a)).length;
        const valuePerOption = 1.0 / correctResponse.length;
        return valuePerOption * numberCorrectlySelected;
    }

    isSingleResponseCorrect(correctResponse: string[], response: string | undefined): boolean {
        return correctResponse.includes(response ?? '');
    }
}

export const MANY_CHOICE_EVALUATOR = new ManyChoiceEvaluator();

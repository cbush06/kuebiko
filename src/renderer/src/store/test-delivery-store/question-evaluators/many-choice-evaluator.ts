import { AbstractQuestionEvaluator } from './abstract-question-evaluator';

class ManyChoiceEvaluator extends AbstractQuestionEvaluator<string[], string> {
    evaluate(correctResponse: string[], response: string[]): number {
        if (correctResponse.length !== response.length) return 0;

        const correctSorted = correctResponse.sort();
        const responseSorted = response.sort();

        const match = correctSorted.reduce((p, n, i) => p && n === responseSorted[i], true);
        return match ? 1 : 0;
    }

    isSingleResponseCorrect(correctResponse: string[], response: string | undefined): boolean {
        return correctResponse.includes(response ?? '');
    }
}

export const MANY_CHOICE_EVALUATOR = new ManyChoiceEvaluator();

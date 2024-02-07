import { AbstractQuestionEvaluator } from './abstract-question-evaluator';

class MultipleChoiceEvaluator extends AbstractQuestionEvaluator<string, string> {
    evaluate(correctResponse: string, response: string): number {
        // q.answer should be the UUID of the correct Option
        // answer should be the UUID of the option chosen by the user
        return (correctResponse as string) === response ? 1 : 0;
    }

    isSingleResponseCorrect(correctResponse: string, response: string | undefined): boolean {
        return (correctResponse as string) === response;
    }
}

export const MULTIPLE_CHOICE_EVALUATOR = new MultipleChoiceEvaluator();

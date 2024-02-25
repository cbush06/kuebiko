import { AnswerType } from '@renderer/db/models/answer';
import { QuestionType } from '@renderer/db/models/question';
import { AbstractQuestionEvaluator } from './abstract-question-evaluator';
import { MANY_CHOICE_EVALUATOR } from './many-choice-evaluator';
import { MULTIPLE_CHOICE_EVALUATOR } from './multiple-choice-evaluator';

export function getQuestionEvaluator(questionType: QuestionType): AbstractQuestionEvaluator<AnswerType, AnswerType> {
    switch (questionType) {
        case 'MULTIPLE':
            return MULTIPLE_CHOICE_EVALUATOR;
        case 'MANY':
            return MANY_CHOICE_EVALUATOR;
        case 'FILL':
        case 'LONG':
        case 'POINT':
        case 'SHORT':
            throw new Error(`Evaluator not implemented for ${questionType} type`);
    }
}

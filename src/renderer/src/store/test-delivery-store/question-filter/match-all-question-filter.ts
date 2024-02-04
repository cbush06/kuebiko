import { AbstractQuestionFilter } from './abstract-question-filter';

export class MatchAllQuestionFilter extends AbstractQuestionFilter {
    match(): boolean {
        return true;
    }
}

export const MATCH_ALL_QUESTION_FILTER = new MatchAllQuestionFilter();

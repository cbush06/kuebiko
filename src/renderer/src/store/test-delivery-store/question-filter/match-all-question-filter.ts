import { AbstractQuestionFilter } from './abstract-question-filter';

export class MatchAllQuestionFilter extends AbstractQuestionFilter {
    match(): boolean {
        return true;
    }
}

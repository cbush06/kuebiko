import { Question } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import { AbstractQuestionFilter } from './abstract-question-filter';

export class CompoundQuestionFilter extends AbstractQuestionFilter {
    constructor(
        test: Test,
        private filters: AbstractQuestionFilter[],
    ) {
        super(test);
    }

    match(question: Question): boolean {
        return this.filters.reduce((result, filter) => result && filter.match(question), true);
    }
}

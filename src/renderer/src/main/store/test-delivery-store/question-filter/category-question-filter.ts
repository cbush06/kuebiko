import { Question } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import { AbstractQuestionFilter } from './abstract-question-filter';

export class CategoryQuestionFilter extends AbstractQuestionFilter {
    constructor(
        private categories: string[],
        test: Test,
    ) {
        super(test);
    }

    match(question: Question): boolean {
        return (
            this.categories.length < 1 ||
            question.categories.filter((c) => this.categories.includes(c)).length > 0
        );
    }
}

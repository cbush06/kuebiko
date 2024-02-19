import { Question } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';
import { AbstractQuestionFilter } from './abstract-question-filter';

export class SectionQuestionFilter extends AbstractQuestionFilter {
    private includedQuestions: string[];

    constructor(
        private sectionsUuids: string[],
        test: Test,
    ) {
        super(test);
        this.includedQuestions = test.sections.filter((s) => sectionsUuids.includes(s.uuid)).flatMap((s) => s.questionRefs);
    }

    match(question: Question): boolean {
        return this.sectionsUuids.length < 1 || this.includedQuestions.includes(question.uuid);
    }
}

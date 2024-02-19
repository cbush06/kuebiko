import { Question } from '@renderer/db/models/question';
import { Test } from '@renderer/db/models/test';

export abstract class AbstractQuestionFilter {
    constructor(protected test: Test) {}

    abstract match(question: Question): boolean;
}

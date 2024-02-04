import { Question } from '@renderer/db/models/question';

export abstract class AbstractQuestionFilter {
    abstract match(question: Question): boolean;
}

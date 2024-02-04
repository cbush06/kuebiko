export class NotEnoughQuestionsErrors extends Error {
    constructor() {
        super('There are not enough questions available to deliver the test as requested.');
    }
}

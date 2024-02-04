export class CannotNavigateError extends Error {
    constructor(direction: 'backward' | 'forward') {
        super(`Cannot go ${direction} because there are no more delivery items.`);
    }
}

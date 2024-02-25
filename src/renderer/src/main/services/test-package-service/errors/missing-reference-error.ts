export class MissingReferenceError extends Error {
    constructor(reference: string, type: string) {
        super(`Expected to find a ${type} with reference ${reference}, but it was missing.`);
    }
}

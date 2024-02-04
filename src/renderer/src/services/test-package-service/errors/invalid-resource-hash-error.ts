export class InvalidResourceHashError extends Error {
    constructor(resourceName: string, resourceUuid: string) {
        super(`Resource with name [${resourceName}] and UUID [${resourceUuid}] has an invalid hash code.`);
    }
}

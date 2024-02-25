export class DeliveryItemIsNotRevisitableError extends Error {
    constructor() {
        super('The previous delivery item cannot be revisited.');
    }
}

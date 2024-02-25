export class NoPreviousDeliveryItemsError extends Error {
    constructor() {
        super('There are no previous items to deliver.');
    }
}

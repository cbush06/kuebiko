export class NoMoreDeliveryItemsError extends Error {
    constructor() {
        super('There are no more items to deliver.');
    }
}

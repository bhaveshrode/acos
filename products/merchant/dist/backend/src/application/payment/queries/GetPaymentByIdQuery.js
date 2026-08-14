/**
 * Query to request loading Payment details by ID.
 */
export class GetPaymentByIdQuery {
    id;
    requestType;
    constructor(id) {
        this.id = id;
    }
}

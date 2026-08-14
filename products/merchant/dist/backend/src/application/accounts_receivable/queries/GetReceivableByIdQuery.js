/**
 * Query to request loading Accounts Receivable details by ID.
 */
export class GetReceivableByIdQuery {
    id;
    requestType;
    constructor(id) {
        this.id = id;
    }
}

/**
 * Query to request loading Invoice details by ID.
 */
export class GetInvoiceByIdQuery {
    id;
    requestType;
    constructor(id) {
        this.id = id;
    }
}

/**
 * Query to request loading a Customer by its unique ID.
 */
export class GetCustomerByIdQuery {
    id;
    requestType;
    constructor(id) {
        this.id = id;
    }
}

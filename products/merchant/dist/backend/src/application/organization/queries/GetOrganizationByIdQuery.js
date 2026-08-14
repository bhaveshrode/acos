/**
 * Query to request loading an Organization details by ID.
 */
export class GetOrganizationByIdQuery {
    id;
    requestType;
    constructor(id) {
        this.id = id;
    }
}

/**
 * Command to request registration of a new Customer.
 */
export class CreateCustomerCommand {
    dto;
    requestType;
    constructor(dto) {
        this.dto = dto;
    }
}

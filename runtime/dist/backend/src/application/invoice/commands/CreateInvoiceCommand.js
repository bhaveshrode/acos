/**
 * Command to request registration of an Invoice in DRAFT status.
 */
export class CreateInvoiceCommand {
    dto;
    requestType;
    constructor(dto) {
        this.dto = dto;
    }
}

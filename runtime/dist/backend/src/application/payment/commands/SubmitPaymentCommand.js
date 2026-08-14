/**
 * Command to request recording of a Payment transaction.
 */
export class SubmitPaymentCommand {
    dto;
    requestType;
    constructor(dto) {
        this.dto = dto;
    }
}

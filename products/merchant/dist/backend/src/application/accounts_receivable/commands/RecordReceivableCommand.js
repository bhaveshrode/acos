/**
 * Command to request recording of an Invoice obligation under Accounts Receivable.
 */
export class RecordReceivableCommand {
    dto;
    requestType;
    constructor(dto) {
        this.dto = dto;
    }
}

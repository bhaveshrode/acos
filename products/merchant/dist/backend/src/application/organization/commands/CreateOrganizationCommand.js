/**
 * Command to request creation of an Organization.
 */
export class CreateOrganizationCommand {
    dto;
    requestType;
    constructor(dto) {
        this.dto = dto;
    }
}

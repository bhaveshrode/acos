/**
 * Command to request registration of a new user.
 */
export class RegisterUserCommand {
    dto;
    requestType;
    constructor(dto) {
        this.dto = dto;
    }
}

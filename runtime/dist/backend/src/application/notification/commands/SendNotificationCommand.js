/**
 * Command to request dispatching or scheduling a Notification.
 */
export class SendNotificationCommand {
    dto;
    constructor(dto) {
        this.dto = dto;
    }
}

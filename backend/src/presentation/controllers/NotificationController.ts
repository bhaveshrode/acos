import { BaseController, IMediator } from "./BaseController.js";

/**
 * NotificationController coordinating SMTP and Twilio delivery dispatch triggers.
 */
export class NotificationController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async sendNotification(body: any): Promise<any> {
    return this.execute({ type: "SendNotificationCommand", body });
  }

  public async getNotificationById(id: string): Promise<any> {
    return this.execute({ type: "GetNotificationByIdQuery", id });
  }
}

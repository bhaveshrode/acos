import { ITool, ToolDescriptor } from "./ITool.js";
import { SendNotificationCommand } from "../../backend/src/application/notification/commands/SendNotificationCommand.js";

export class SendNotificationTool implements ITool {
  public readonly descriptor: ToolDescriptor = {
    id: "tool_send_notification",
    name: "SendNotificationTool",
    description: "Sends system or customer notifications (reminders, billing notices).",
    permissions: ["notification.send"],
    riskLevel: "LOW",
    requiredApproval: false
  };

  public async execute(payload: any, mediator: any): Promise<any> {
    const command = new SendNotificationCommand({
      organizationId: payload.organizationId || "org-456",
      reference: payload.reference || `notif_${Date.now()}`,
      subject: payload.subject || "Billing Reminder",
      body: payload.body || "Please note that your invoice is overdue.",
      priority: payload.priority || "HIGH",
      recipients: [
        {
          userId: payload.userId,
          email: payload.email || "customer@example.com",
          phone: payload.phone,
          channelPreferences: [payload.type || "email"]
        }
      ]
    });

    return await mediator.send(command);
  }
}

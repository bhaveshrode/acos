import { SendNotificationCommand } from "../../backend/src/application/notification/commands/SendNotificationCommand.js";
export class SendNotificationTool {
    descriptor = {
        id: "tool_send_notification",
        name: "SendNotificationTool",
        description: "Sends system or customer notifications (reminders, billing notices).",
        permissions: ["notification.send"],
        riskLevel: "LOW",
        requiredApproval: false
    };
    async execute(payload, mediator) {
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

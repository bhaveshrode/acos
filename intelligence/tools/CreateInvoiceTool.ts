import { ITool, ToolDescriptor } from "./ITool.js";
import { CreateInvoiceCommand } from "../../backend/src/application/invoice/commands/CreateInvoiceCommand.js";

export class CreateInvoiceTool implements ITool {
  public readonly descriptor: ToolDescriptor = {
    id: "tool_create_invoice",
    name: "CreateInvoiceTool",
    description: "Creates a new invoice in ACOS in DRAFT status.",
    permissions: ["invoice.create"],
    riskLevel: "LOW",
    requiredApproval: false
  };

  public async execute(payload: any, mediator: any): Promise<any> {
    const command = new CreateInvoiceCommand({
      organizationId: payload.organizationId,
      customerId: payload.customerId,
      invoiceNumber: payload.invoiceNumber,
      currency: payload.currency || "USD",
      paymentTerms: payload.paymentTerms || "NET_30",
      issueDate: payload.issueDate || new Date().toISOString(),
      dueDate: payload.dueDate || new Date(Date.now() + 86400000 * 30).toISOString(),
      lines: payload.lines || []
    });

    return await mediator.send(command);
  }
}

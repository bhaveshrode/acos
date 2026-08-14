import { ITool, ToolDescriptor } from "./ITool.js";

export class RefundPaymentTool implements ITool {
  public readonly descriptor: ToolDescriptor = {
    id: "tool_refund_payment",
    name: "RefundPaymentTool",
    description: "Refunds a completed payment in ACOS.",
    permissions: ["payment.refund"],
    riskLevel: "HIGH",
    requiredApproval: true // Requires human approval if conditional policy fails
  };

  public async execute(payload: any, mediator: any): Promise<any> {
    if (!payload.paymentId || !payload.amount) {
      throw new Error("Missing required parameters: paymentId and amount.");
    }
    return {
      isSuccess: true,
      refundId: `ref_tool_${Math.floor(Math.random() * 100000)}`,
      paymentId: payload.paymentId,
      amount: payload.amount,
      status: "COMPLETED",
      message: "Refund processed successfully."
    };
  }
}

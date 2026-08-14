import { ITool } from "./ITool.js";
import { CreateInvoiceTool } from "./CreateInvoiceTool.js";
import { RefundPaymentTool } from "./RefundPaymentTool.js";
import { ReconcilePaymentTool } from "./ReconcilePaymentTool.js";
import { SendNotificationTool } from "./SendNotificationTool.js";

export class ToolRegistry {
  private readonly tools = new Map<string, ITool>();
  private isFrozen = false;

  constructor() {
    this.register(new CreateInvoiceTool());
    this.register(new RefundPaymentTool());
    this.register(new ReconcilePaymentTool());
    this.register(new SendNotificationTool());
    this.freeze();
  }

  public register(tool: ITool): void {
    if (this.isFrozen) {
      throw new Error("Cannot register new tools on a frozen ToolRegistry.");
    }
    this.tools.set(tool.descriptor.name, tool);
  }

  public getTool(name: string): ITool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' is not registered in ToolRegistry.`);
    }
    return tool;
  }

  public listTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  public freeze(): void {
    this.isFrozen = true;
    Object.freeze(this);
  }
}

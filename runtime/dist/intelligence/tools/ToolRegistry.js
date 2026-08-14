import { CreateInvoiceTool } from "./CreateInvoiceTool.js";
import { RefundPaymentTool } from "./RefundPaymentTool.js";
import { ReconcilePaymentTool } from "./ReconcilePaymentTool.js";
import { SendNotificationTool } from "./SendNotificationTool.js";
export class ToolRegistry {
    tools = new Map();
    isFrozen = false;
    constructor() {
        this.register(new CreateInvoiceTool());
        this.register(new RefundPaymentTool());
        this.register(new ReconcilePaymentTool());
        this.register(new SendNotificationTool());
        this.freeze();
    }
    register(tool) {
        if (this.isFrozen) {
            throw new Error("Cannot register new tools on a frozen ToolRegistry.");
        }
        this.tools.set(tool.descriptor.name, tool);
    }
    getTool(name) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool '${name}' is not registered in ToolRegistry.`);
        }
        return tool;
    }
    listTools() {
        return Array.from(this.tools.values());
    }
    freeze() {
        this.isFrozen = true;
        Object.freeze(this);
    }
}

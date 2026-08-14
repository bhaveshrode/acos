export interface ToolDescriptor {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  riskLevel: "LOW" | "HIGH" | "CRITICAL";
  requiredApproval: boolean;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface ITool {
  readonly descriptor: ToolDescriptor;
  execute(payload: any, mediator: any): Promise<any>;
}

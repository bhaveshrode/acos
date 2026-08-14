import { ToolRegistry } from "../tools/ToolRegistry.js";

export class ToolFactory {
  public createToolRegistry(): ToolRegistry {
    return new ToolRegistry();
  }
}

import { ToolRegistry } from "../tools/ToolRegistry.js";
export class ToolFactory {
    createToolRegistry() {
        return new ToolRegistry();
    }
}

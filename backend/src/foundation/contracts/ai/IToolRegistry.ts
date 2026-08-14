import { ITool } from "./ITool.js";

/**
 * Interface representing a registry mapping tool names to execution instances.
 */
export interface IToolRegistry {
  /**
   * Registers a tool.
   */
  register(tool: ITool): void;

  /**
   * Retrieves a tool by name, returning null if not found.
   */
  getTool(name: string): ITool | null;

  /**
   * Lists all registered tools.
   */
  getTools(): readonly ITool[];
}

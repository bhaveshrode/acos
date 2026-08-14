import { ExecutionEngine } from "../execution/ExecutionEngine.js";
import { ToolRegistry } from "../tools/ToolRegistry.js";
import { MemoryStore } from "../memory/MemoryStore.js";
import { TelemetryEmitter } from "../observability/TelemetryEmitter.js";

export class ExecutionFactory {
  public createExecutionEngine(
    toolRegistry: ToolRegistry,
    memoryStore: MemoryStore,
    telemetryEmitter: TelemetryEmitter
  ): ExecutionEngine {
    return new ExecutionEngine(toolRegistry, memoryStore, telemetryEmitter);
  }
}

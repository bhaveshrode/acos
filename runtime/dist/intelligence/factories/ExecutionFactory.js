import { ExecutionEngine } from "../execution/ExecutionEngine.js";
export class ExecutionFactory {
    createExecutionEngine(toolRegistry, memoryStore, telemetryEmitter) {
        return new ExecutionEngine(toolRegistry, memoryStore, telemetryEmitter);
    }
}

import { MessageDispatcher } from "./MessageDispatcher.js";
import { SocketMessage } from "./SocketMessage.js";

/**
 * WorkflowSocketHandler streaming real-time workflow notifications.
 */
export class WorkflowSocketHandler {
  constructor(private readonly dispatcher: MessageDispatcher) {}

  public handleWorkflowTransition(workflowId: string, state: string): void {
    const message = new SocketMessage("workflow:transitioned", { workflowId, state });
    this.dispatcher.broadcast(message);
  }
}

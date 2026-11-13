import { WorkflowEventDispatcher } from "./WorkflowEventDispatcher.js";
import { WorkflowLifecycleEvent } from "./WorkflowLifecycleEvent.js";
import { SubscriptionToken } from "../state/SubscriptionToken.js";

/**
 * WorkflowObserver subscribing to workflow lifecycles updates.
 */
export class WorkflowObserver {
  constructor(private readonly dispatcher: WorkflowEventDispatcher) {}

  public observe(callback: (event: WorkflowLifecycleEvent) => void): SubscriptionToken {
    const unsub = this.dispatcher.subscribe(callback);
    return new SubscriptionToken(unsub);
  }
}

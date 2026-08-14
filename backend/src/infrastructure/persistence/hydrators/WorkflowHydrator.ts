import { Workflow } from "../../../business/workflow/aggregates/Workflow.js";
import { WorkflowId } from "../../../business/workflow/value-objects/WorkflowId.js";
import { WorkflowSnapshot } from "../snapshots/WorkflowSnapshot.js";
import { WorkflowDeserializer } from "../deserializers/WorkflowDeserializer.js";

/**
 * Reconstructs the complete Workflow aggregate root from historical snapshot state.
 */
export class WorkflowHydrator {
  public static hydrate(snapshot: WorkflowSnapshot): Workflow {
    const props = WorkflowDeserializer.deserialize(snapshot);
    const id = new WorkflowId(snapshot.id);
    return new (Workflow as any)(id, props) as Workflow;
  }
}

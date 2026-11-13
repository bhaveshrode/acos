import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { WorkflowApi } from "../api/WorkflowApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * WorkflowState representing state workflow tracks.
 */
export interface WorkflowState {
  workflows: any[];
  activeWorkflow: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * WorkflowStore coordinating step mutations.
 */
export class WorkflowStore implements IFeatureStore<WorkflowState> {
  constructor(
    private readonly store: IStateStore<WorkflowState>,
    private readonly api: WorkflowApi
  ) {}

  public getState(): WorkflowState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<WorkflowState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: WorkflowState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchWorkflow(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getWorkflow(id);
      this.store.update((s) => {
        s.activeWorkflow = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch workflow";
        s.loading = false;
      });
    }
  }

  public async triggerWorkflowAction(id: string, payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.triggerWorkflowAction(id, payload);
      this.store.update((s) => {
        const index = s.workflows.findIndex((w) => w.id === id);
        if (index !== -1) {
          s.workflows[index] = response.data;
        } else {
          s.workflows.push(response.data);
        }
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to trigger workflow action";
        s.loading = false;
      });
    }
  }
}

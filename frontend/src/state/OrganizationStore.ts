import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { OrganizationApi } from "../api/OrganizationApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * OrganizationState representing organization profiles configuration.
 */
export interface OrganizationState {
  activeOrganization: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * OrganizationStore coordinating settings modifications.
 */
export class OrganizationStore implements IFeatureStore<OrganizationState> {
  constructor(
    private readonly store: IStateStore<OrganizationState>,
    private readonly api: OrganizationApi
  ) {}

  public getState(): OrganizationState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<OrganizationState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: OrganizationState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchOrganization(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getOrganization(id);
      this.store.update((s) => {
        s.activeOrganization = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch organization";
        s.loading = false;
      });
    }
  }
}

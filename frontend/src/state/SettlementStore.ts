import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { SettlementApi } from "../api/SettlementApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * SettlementState representing settlements details.
 */
export interface SettlementState {
  settlements: any[];
  activeSettlement: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * SettlementStore coordinating settlement runs.
 */
export class SettlementStore implements IFeatureStore<SettlementState> {
  constructor(
    private readonly store: IStateStore<SettlementState>,
    private readonly api: SettlementApi
  ) {}

  public getState(): SettlementState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<SettlementState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: SettlementState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchSettlement(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getSettlement(id);
      this.store.update((s) => {
        s.activeSettlement = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch settlement";
        s.loading = false;
      });
    }
  }

  public async initiateSettlement(payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.initiateSettlement(payload);
      this.store.update((s) => {
        s.settlements.push(response.data);
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to initiate settlement";
        s.loading = false;
      });
    }
  }
}

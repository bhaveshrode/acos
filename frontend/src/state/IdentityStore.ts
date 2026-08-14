import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { IdentityApi } from "../api/IdentityApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * IdentityState representing authentication states.
 */
export interface IdentityState {
  isAuthenticated: boolean;
  currentUser: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * IdentityStore coordinating login and register actions.
 */
export class IdentityStore implements IFeatureStore<IdentityState> {
  constructor(
    private readonly store: IStateStore<IdentityState>,
    private readonly api: IdentityApi
  ) {}

  public getState(): IdentityState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<IdentityState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: IdentityState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async login(payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.login(payload);
      this.store.update((s) => {
        s.currentUser = response.data;
        s.isAuthenticated = true;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Login failed";
        s.loading = false;
      });
    }
  }

  public async register(payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      await this.api.register(payload);
      this.store.update((s) => {
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Registration failed";
        s.loading = false;
      });
    }
  }
}

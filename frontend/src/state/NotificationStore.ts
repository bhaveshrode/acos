import { IStateStore } from "./IStateStore.js";
import { IFeatureStore } from "./IFeatureStore.js";
import { NotificationApi } from "../api/NotificationApi.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * NotificationState representing alert delivery statuses.
 */
export interface NotificationState {
  notifications: any[];
  activeNotification: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * NotificationStore coordinating notifications dispatches.
 */
export class NotificationStore implements IFeatureStore<NotificationState> {
  constructor(
    private readonly store: IStateStore<NotificationState>,
    private readonly api: NotificationApi
  ) {}

  public getState(): NotificationState {
    return this.store.getState();
  }

  public getSnapshot(): StateSnapshot<NotificationState> {
    return this.store.getSnapshot();
  }

  public subscribe(listener: (state: NotificationState) => void): () => void {
    return this.store.subscribe(listener);
  }

  public async fetchNotification(id: string): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.getNotification(id);
      this.store.update((s) => {
        s.activeNotification = response.data;
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to fetch notification";
        s.loading = false;
      });
    }
  }

  public async sendNotification(payload: any): Promise<void> {
    this.store.update((s) => {
      s.loading = true;
      s.error = null;
    });

    try {
      const response = await this.api.sendNotification(payload);
      this.store.update((s) => {
        s.notifications.push(response.data);
        s.loading = false;
      });
    } catch (err: any) {
      this.store.update((s) => {
        s.error = err.message || "Failed to send notification";
        s.loading = false;
      });
    }
  }
}

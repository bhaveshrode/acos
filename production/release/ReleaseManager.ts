import { Release } from "./Release.js";
import { RollbackManager } from "./RollbackManager.js";

/**
 * ReleaseManager validating and executing release promotions.
 */
export class ReleaseManager {
  private activeRelease?: Release;
  private readonly history: Release[] = [];

  constructor(private readonly rollback: RollbackManager) {}

  public async deployCandidate(candidate: Release, verifyFn: () => Promise<boolean>): Promise<boolean> {
    this.history.push(candidate);
    
    try {
      const isHealthy = await verifyFn();
      if (!isHealthy) {
        throw new Error("Smoke health check failed post-deployment");
      }

      this.activeRelease = candidate;
      this.rollback.setStable(candidate);
      return true;
    } catch (err: any) {
      // Trigger rollback to previous stable
      const previous = this.history[this.history.length - 2];
      if (previous) {
        this.rollback.rollbackTo(previous);
        this.activeRelease = previous;
      } else {
        this.activeRelease = undefined;
      }
      return false; // Deploy failed
    }
  }

  public getActiveRelease(): Release | undefined {
    return this.activeRelease;
  }

  public getHistory(): readonly Release[] {
    return Object.freeze([...this.history]);
  }
}

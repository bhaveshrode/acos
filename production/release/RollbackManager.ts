import { Release } from "./Release.js";

/**
 * RollbackManager rolling back failed deployments.
 */
export class RollbackManager {
  private activeRelease?: Release;

  public setStable(release: Release): void {
    this.activeRelease = release;
  }

  public rollbackTo(stableRelease: Release): string {
    this.activeRelease = stableRelease;
    return `Successfully rolled back to version ${stableRelease.version}`;
  }

  public getActiveRelease(): Release | undefined {
    return this.activeRelease;
  }
}

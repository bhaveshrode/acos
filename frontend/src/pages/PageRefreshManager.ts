import { IPage } from "./IPage.js";

/**
 * PageRefreshManager triggering reload and refetch logic.
 */
export class PageRefreshManager {
  public async refresh(page: IPage): Promise<void> {
    await page.loadData();
  }
}

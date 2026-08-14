import { SDKManager } from "../sdk/SDKManager.js";

export class SDKFactory {
  public createManager(): SDKManager {
    return new SDKManager();
  }
}

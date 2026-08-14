import { LocalStorageProvider } from "../providers/LocalStorageProvider.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

/**
 * Factory class generating concrete storage providers.
 */
export class StorageFactory {
  /**
   * Instantiates a LocalStorageProvider using configurations.
   */
  public static createLocalStorageProvider(config?: ConfigurationSnapshot): LocalStorageProvider {
    const root = "./.tmp/storage";
    return new LocalStorageProvider(root);
  }
}

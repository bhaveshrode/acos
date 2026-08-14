import { GoogleDriveAdapter } from "./GoogleDriveAdapter.js";
import { DropboxAdapter } from "./DropboxAdapter.js";
import { IStorageProvider } from "./IStorageProvider.js";

/**
 * StorageFactory constructing storage provider integrations.
 */
export class StorageFactory {
  public static createGoogleDriveAdapter(): IStorageProvider {
    return new GoogleDriveAdapter();
  }

  public static createDropboxAdapter(): IStorageProvider {
    return new DropboxAdapter();
  }

  public createGoogleDriveAdapter(): IStorageProvider {
    return StorageFactory.createGoogleDriveAdapter();
  }

  public createDropboxAdapter(): IStorageProvider {
    return StorageFactory.createDropboxAdapter();
  }
}

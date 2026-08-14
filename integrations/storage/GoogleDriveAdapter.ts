import { IStorageProvider } from "./IStorageProvider.js";

/**
 * GoogleDriveAdapter adapting external Google Drive storage APIs.
 */
export class GoogleDriveAdapter implements IStorageProvider {
  public async uploadFile(path: string, content: string): Promise<string> {
    return `gdrive_file_id_${path}`;
  }

  public async downloadFile(fileId: string): Promise<string> {
    return `gdrive_content_for_${fileId}`;
  }
}

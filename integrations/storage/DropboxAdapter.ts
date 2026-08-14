import { IStorageProvider } from "./IStorageProvider.js";

/**
 * DropboxAdapter adapting external Dropbox storage APIs.
 */
export class DropboxAdapter implements IStorageProvider {
  public async uploadFile(path: string, content: string): Promise<string> {
    return `dropbox_file_id_${path}`;
  }

  public async downloadFile(fileId: string): Promise<string> {
    return `dropbox_content_for_${fileId}`;
  }
}

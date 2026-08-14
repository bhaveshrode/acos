/**
 * IStorageProvider interface declaring document upload/download hooks.
 */
export interface IStorageProvider {
  uploadFile(path: string, content: string): Promise<string>;
  downloadFile(fileId: string): Promise<string>;
}

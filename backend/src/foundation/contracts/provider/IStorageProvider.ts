import { Result } from "../../result/Result.js";

/**
 * Interface representing file and blob storage capabilities (e.g. AWS S3, Local Disk, Azure Blob).
 */
export interface IStorageProvider {
  /**
   * Uploads file content to a specific path.
   */
  upload(path: string, content: Buffer): Promise<Result<void>>;

  /**
   * Downloads file content from a specific path.
   */
  download(path: string): Promise<Result<Buffer>>;

  /**
   * Deletes a file at a specific path.
   */
  delete(path: string): Promise<Result<void>>;

  /**
   * Generates a temporary pre-signed URL for direct browser access.
   */
  getSignedUrl(path: string, expiresInSeconds: number): Promise<Result<string>>;
}

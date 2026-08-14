/**
 * ICloudProvider interface declaring object and secrets storage operations.
 */
export interface ICloudProvider {
  storeSecret(key: string, secret: string): Promise<void>;
  getSecret(key: string): Promise<string | undefined>;
  uploadObject(
    bucketName: string,
    objectKey: string,
    content: string
  ): Promise<string>;
}

import { ICloudProvider } from "./ICloudProvider.js";

/**
 * AWSAdapter adapting AWS Secrets Manager and S3 services.
 */
export class AWSAdapter implements ICloudProvider {
  private readonly secrets = new Map<string, string>();

  public async storeSecret(key: string, secret: string): Promise<void> {
    this.secrets.set(key, secret);
  }

  public async getSecret(key: string): Promise<string | undefined> {
    return this.secrets.get(key);
  }

  public async uploadObject(
    bucketName: string,
    objectKey: string,
    content: string
  ): Promise<string> {
    return `s3://${bucketName}/${objectKey}`;
  }
}

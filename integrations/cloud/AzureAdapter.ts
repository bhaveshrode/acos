import { ICloudProvider } from "./ICloudProvider.js";

/**
 * AzureAdapter adapting Azure Blob Storage and Key Vault services.
 */
export class AzureAdapter implements ICloudProvider {
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
    return `https://${bucketName}.blob.core.windows.net/${objectKey}`;
  }
}

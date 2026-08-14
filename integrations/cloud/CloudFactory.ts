import { AWSAdapter } from "./AWSAdapter.js";
import { AzureAdapter } from "./AzureAdapter.js";
import { ICloudProvider } from "./ICloudProvider.js";

/**
 * CloudFactory constructing cloud provider integrations.
 */
export class CloudFactory {
  public static createAWSAdapter(): ICloudProvider {
    return new AWSAdapter();
  }

  public static createAzureAdapter(): ICloudProvider {
    return new AzureAdapter();
  }

  public createAWSAdapter(): ICloudProvider {
    return CloudFactory.createAWSAdapter();
  }

  public createAzureAdapter(): ICloudProvider {
    return CloudFactory.createAzureAdapter();
  }
}

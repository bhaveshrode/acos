import { SecretKey } from "./SecretKey.js";
import { ISecretProvider } from "./ISecretProvider.js";
import { VaultProvider } from "./VaultProvider.js";
import { EnvironmentProvider } from "./EnvironmentProvider.js";
import { AzureKeyVaultProvider } from "./AzureKeyVaultProvider.js";
import { AWSSecretsProvider } from "./AWSSecretsProvider.js";
import { SecretsManager } from "./SecretsManager.js";

/**
 * SecretsFactory creating manager classes and encrypted keys.
 */
export class SecretsFactory {
  public static createKey(
    id: string,
    value: string,
    version?: string
  ): SecretKey {
    return new SecretKey(id, value, version);
  }

  public static createVaultProvider(): ISecretProvider {
    return new VaultProvider();
  }

  public static createEnvironmentProvider(): ISecretProvider {
    return new EnvironmentProvider();
  }

  public static createAzureProvider(): ISecretProvider {
    return new AzureKeyVaultProvider();
  }

  public static createAWSProvider(): ISecretProvider {
    return new AWSSecretsProvider();
  }

  public static createManager(provider: ISecretProvider): SecretsManager {
    return new SecretsManager(provider);
  }

  public createKey(id: string, value: string, version?: string): SecretKey {
    return SecretsFactory.createKey(id, value, version);
  }

  public createVaultProvider(): ISecretProvider {
    return SecretsFactory.createVaultProvider();
  }

  public createEnvironmentProvider(): ISecretProvider {
    return SecretsFactory.createEnvironmentProvider();
  }

  public createAzureProvider(): ISecretProvider {
    return SecretsFactory.createAzureProvider();
  }

  public createAWSProvider(): ISecretProvider {
    return SecretsFactory.createAWSProvider();
  }

  public createManager(provider: ISecretProvider): SecretsManager {
    return SecretsFactory.createManager(provider);
  }
}

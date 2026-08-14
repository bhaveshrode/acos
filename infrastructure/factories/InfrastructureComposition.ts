import { InfrastructureConfiguration } from "../configuration/InfrastructureConfiguration.js";
import { InfrastructureProfile } from "../configuration/InfrastructureProfile.js";
import { InfrastructureConfigurationValidator } from "../configuration/InfrastructureConfigurationValidator.js";
import { DatabaseConnectionManager } from "../database/DatabaseConnectionManager.js";
import { MigrationRunner } from "../database/MigrationRunner.js";
import { DatabaseBackupAdapter } from "../database/DatabaseBackupAdapter.js";
import { TransactionVerifier } from "../database/TransactionVerifier.js";
import { CacheClient } from "../cache/CacheClient.js";
import { DistributedLock } from "../cache/DistributedLock.js";
import { MessageBrokerImpl } from "../messaging/MessageBrokerImpl.js";
import { ContainerBuilder } from "../containers/ContainerBuilder.js";
import { NetworkGateway } from "../network/NetworkGateway.js";
import { DeploymentPipeline } from "../cicd/DeploymentPipeline.js";
import { InfrastructureTelemetry } from "../observability/InfrastructureTelemetry.js";

/**
 * InfrastructureComposition bundling physical sub-systems.
 */
export class InfrastructureComposition {
  public readonly config = new InfrastructureConfiguration(
    InfrastructureProfile.Development,
    "mock://localhost:5432/acos_dev",
    10,
    "mock://localhost:6379",
    "mock://localhost:5672"
  );
  public readonly validator = new InfrastructureConfigurationValidator();

  public readonly dbConnection = new DatabaseConnectionManager(this.config);
  public readonly migrationRunner = new MigrationRunner();
  public readonly dbBackup = new DatabaseBackupAdapter();
  public readonly txVerifier = new TransactionVerifier();

  public readonly cache = new CacheClient();
  public readonly locks = new DistributedLock(this.cache);

  public readonly broker = new MessageBrokerImpl();

  public readonly containerBuilder = new ContainerBuilder();
  public readonly gateway = new NetworkGateway();

  public readonly pipeline = new DeploymentPipeline();
  public readonly telemetry = new InfrastructureTelemetry();

  constructor() {
    Object.freeze(this);
  }
}

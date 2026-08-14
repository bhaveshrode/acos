import { MapperRegistry } from "../common/MapperRegistry.js";
import { PrismaMapper } from "../database/PrismaMapper.js";
import { EventPayloadMapper } from "../messaging/EventPayloadMapper.js";
import { TransactionMapper } from "../blockchain/TransactionMapper.js";
import { NotificationMapper } from "../notification/NotificationMapper.js";
import { StorageMapper } from "../storage/StorageMapper.js";
import { ConfigurationMapper } from "../configuration/ConfigurationMapper.js";

/**
 * Factory class initializing and seeding the central mapper registry database.
 */
export class MappingFactory {
  private static initialized = false;

  /**
   * Registers all core mapping instances.
   */
  public static initializeRegistry(): void {
    if (this.initialized) return;

    MapperRegistry.register("MockPersistenceSnapshot", "MockPrismaRow", new PrismaMapper());
    MapperRegistry.register("DomainEvent", "OutboxLogEntry", new EventPayloadMapper());
    MapperRegistry.register("RawSdkTxResponse", "UnifiedReceipt", new TransactionMapper());
    MapperRegistry.register("GenericAlert", "SmtpPayload", new NotificationMapper());
    MapperRegistry.register("RawUploadResult", "FileMetadata", new StorageMapper());
    MapperRegistry.register("ConfigurationSnapshot", "CleanDatabaseSettings", new ConfigurationMapper());

    this.initialized = true;
  }

  /**
   * Resets mappings and initialization indicators.
   */
  public static reset(): void {
    MapperRegistry.clear();
    this.initialized = false;
  }
}

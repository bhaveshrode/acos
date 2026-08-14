import { MapperBase } from "../common/MapperBase.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

export interface CleanDatabaseSettings {
  url: string;
  maxPoolSize: number;
}

/**
 * Mapper extracting flat database connections out of configuration snapshot structures.
 */
export class ConfigurationMapper extends MapperBase<ConfigurationSnapshot, CleanDatabaseSettings> {
  public map(source: ConfigurationSnapshot): CleanDatabaseSettings {
    return {
      url: source.database?.url || "postgresql://localhost:5432",
      maxPoolSize: source.database?.poolSize || 10
    };
  }
}

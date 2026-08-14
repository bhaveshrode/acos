import { MapperBase } from "../common/MapperBase.js";

export interface MockPersistenceSnapshot {
  id: string;
  version: number;
  data: string;
}

export interface MockPrismaRow {
  id: string;
  version_num: number;
  raw_payload: string;
  created_at: Date;
}

/**
 * Mapper converting flat persistence snapshots into raw database rows.
 */
export class PrismaMapper extends MapperBase<MockPersistenceSnapshot, MockPrismaRow> {
  public map(source: MockPersistenceSnapshot): MockPrismaRow {
    return {
      id: source.id,
      version_num: source.version,
      raw_payload: source.data,
      created_at: new Date()
    };
  }
}

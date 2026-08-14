import { IIdempotencyStore } from "./IIdempotencyStore.js";

/**
 * Prisma database-backed implementation of IIdempotencyStore.
 */
export class PrismaIdempotencyStore implements IIdempotencyStore {
  constructor(private readonly prismaClient: any) {}

  public async get(key: string): Promise<{ statusCode: number; responseBody: string } | null> {
    try {
      const record = await this.prismaClient.idempotencyRecord.findUnique({
        where: { id: key }
      });
      if (record) {
        return {
          statusCode: record.statusCode,
          responseBody: record.responseBody
        };
      }
    } catch (err: any) {
      // Fail-silent: let request continue if DB query fails
    }
    return null;
  }

  public async save(key: string, statusCode: number, responseBody: string): Promise<void> {
    try {
      await this.prismaClient.idempotencyRecord.upsert({
        where: { id: key },
        update: { statusCode, responseBody },
        create: { id: key, statusCode, responseBody }
      });
    } catch (err: any) {
      // Fail-silent
    }
  }

  public async clear(): Promise<void> {
    try {
      await this.prismaClient.idempotencyRecord.deleteMany({});
    } catch (err: any) {
      // Fail-silent
    }
  }
}

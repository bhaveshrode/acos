import { describe, it, expect, beforeEach } from "vitest";
import { MappingFactory } from "../factories/MappingFactory.js";
import { MapperRegistry } from "../common/MapperRegistry.js";
import { PrismaMapper, MockPersistenceSnapshot } from "../database/PrismaMapper.js";
import { EventPayloadMapper, DomainEvent } from "../messaging/EventPayloadMapper.js";
import { TransactionMapper, RawSdkTxResponse } from "../blockchain/TransactionMapper.js";
import { NotificationMapper, GenericAlert } from "../notification/NotificationMapper.js";
import { StorageMapper, RawUploadResult } from "../storage/StorageMapper.js";
import { ConfigurationMapper } from "../configuration/ConfigurationMapper.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

describe("Mapping Infrastructure Layer Tests (Task 35.7)", () => {
  beforeEach(() => {
    MappingFactory.reset();
    MappingFactory.initializeRegistry();
  });

  describe("MapperRegistry and Factory Lookup", () => {
    it("should resolve seeded mapper instances from register and handle mapArray operations", () => {
      const mapper = MapperRegistry.get<MockPersistenceSnapshot, any>(
        "MockPersistenceSnapshot",
        "MockPrismaRow"
      );
      expect(mapper).toBeInstanceOf(PrismaMapper);

      const snapshots: MockPersistenceSnapshot[] = [
        { id: "1", version: 1, data: "payload-1" },
        { id: "2", version: 2, data: "payload-2" }
      ];
      const rows = mapper.mapArray(snapshots);
      expect(rows.length).toBe(2);
      expect(rows[0].id).toBe("1");
      expect(rows[0].version_num).toBe(1);
      expect(rows[1].raw_payload).toBe("payload-2");
    });

    it("should raise an error when lookup targets unregistered types", () => {
      expect(() => {
        MapperRegistry.get("NonExistentSource", "NonExistentTarget");
      }).toThrow("No mapper registered for conversion key");
    });
  });

  describe("PrismaMapper", () => {
    it("should transform snapshot objects to relational ORM row models", () => {
      const snap: MockPersistenceSnapshot = { id: "snap-123", version: 4, data: "{}" };
      const mapper = new PrismaMapper();
      const row = mapper.map(snap);

      expect(row.id).toBe("snap-123");
      expect(row.version_num).toBe(4);
      expect(row.raw_payload).toBe("{}");
      expect(row.created_at).toBeInstanceOf(Date);
    });
  });

  describe("EventPayloadMapper", () => {
    it("should transform domain event items to JSON serialized outbox payloads", () => {
      const occurred = new Date();
      const event: DomainEvent = {
        eventId: "evt-001",
        eventType: "CustomerCreatedEvent",
        occurredAt: occurred,
        data: { name: "Alice", active: true }
      };
      const mapper = new EventPayloadMapper();
      const outbox = mapper.map(event);

      expect(outbox.messageId).toBe("evt-001");
      expect(outbox.messageType).toBe("CustomerCreatedEvent");
      expect(outbox.occurredAt).toBe(occurred);
      expect(JSON.parse(outbox.payloadJson)).toEqual({ name: "Alice", active: true });
    });
  });

  describe("TransactionMapper", () => {
    it("should transform raw SDK block logs to standardized receipt fields", () => {
      const rawTx: RawSdkTxResponse = {
        hash: "0xhash",
        blockNumber: 4567,
        gasUsed: "21000",
        from: "0xsender",
        to: "0xrecipient"
      };
      const mapper = new TransactionMapper();
      const receipt = mapper.map(rawTx);

      expect(receipt.transactionHash).toBe("0xhash");
      expect(receipt.height).toBe(4567);
      expect(receipt.feePaid).toBe(0.0021); // 21000 * 0.0000001
      expect(receipt.sender).toBe("0xsender");
      expect(receipt.recipient).toBe("0xrecipient");
    });
  });

  describe("NotificationMapper", () => {
    it("should transform custom alert parameters into SMTP bodies", () => {
      const alert: GenericAlert = {
        targetEmail: "bob@acos.io",
        title: "Security Update",
        username: "BobS",
        body: "Your profile has been modified."
      };
      const mapper = new NotificationMapper();
      const payload = mapper.map(alert);

      expect(payload.recipientAddress).toBe("bob@acos.io");
      expect(payload.mailSubject).toBe("Security Update");
      expect(payload.htmlBody).toContain("BobS");
      expect(payload.htmlBody).toContain("Your profile has been modified.");
    });
  });

  describe("StorageMapper", () => {
    it("should transform raw upload results to standardized metadata cards", () => {
      const rawUpload: RawUploadResult = {
        fileKey: "invoice-777.pdf",
        byteLength: 459800,
        sha256Hash: "abcdef12345"
      };
      const mapper = new StorageMapper();
      const meta = mapper.map(rawUpload);

      expect(meta.fileName).toBe("invoice-777.pdf");
      expect(meta.size).toBe(459800);
      expect(meta.checksum).toBe("abcdef12345");
    });
  });

  describe("ConfigurationMapper", () => {
    it("should transform configurations to flat database options", () => {
      const snap = {
        database: {
          url: "postgres://admin@localhost:5432/db",
          poolSize: 25
        }
      } as ConfigurationSnapshot;

      const mapper = new ConfigurationMapper();
      const settings = mapper.map(snap);

      expect(settings.url).toBe("postgres://admin@localhost:5432/db");
      expect(settings.maxPoolSize).toBe(25);
    });
  });
});

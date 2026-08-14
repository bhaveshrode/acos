import { describe, it, expect, beforeEach, vi } from "vitest";
import { ServiceContainer } from "../dependency-injection/container/ServiceContainer.js";
import { Lifetime } from "../dependency-injection/lifetimes/Lifetime.js";
import { ConfigurationBuilder } from "../configuration/builders/ConfigurationBuilder.js";
import { JsonConfigurationProvider } from "../configuration/providers/JsonConfigurationProvider.js";
import { MigrationHistory } from "../migrations/history/MigrationHistory.js";
import { MigrationRunner } from "../migrations/runners/MigrationRunner.js";
import { InitialSchemaMigration } from "../migrations/scripts/001_initial_schema.js";
import { AddIndexesMigration } from "../migrations/scripts/002_add_indexes.js";
import { SeedRunner } from "../migrations/seeds/SeedRunner.js";
import { LocalStorageProvider } from "../storage/providers/LocalStorageProvider.js";
import { UploadManager } from "../storage/uploads/UploadManager.js";
import { DownloadManager } from "../storage/downloads/DownloadManager.js";
import { ChecksumCalculator } from "../storage/checksum/ChecksumCalculator.js";
import { ConfirmationTracker } from "../blockchain/confirmations/ConfirmationTracker.js";
import { SettlementVerifier } from "../blockchain/settlement/SettlementVerifier.js";
import { MockWalletProvider } from "../blockchain/providers/MockWalletProvider.js";
import { NotificationQueue } from "../notification/queue/NotificationQueue.js";
import { NotificationDispatcher } from "../notification/queue/NotificationDispatcher.js";
import { EmailChannel } from "../notification/channels/EmailChannel.js";
import { SmsChannel } from "../notification/channels/SmsChannel.js";
import { SmtpEmailProvider } from "../notification/providers/SmtpEmailProvider.js";
import { TwilioSmsProvider } from "../notification/providers/TwilioSmsProvider.js";
import { TextFormatter } from "../logging/formatters/TextFormatter.js";
import { Result } from "../../foundation/result/Result.js";
import fs from "fs";

describe("ACOS Master Infrastructure Integration Tests (Task 37.1)", () => {
  const container = new ServiceContainer();
  const testStorageDir = "./.tmp/e2e-integration-storage";

  beforeEach(() => {
    MigrationHistory.clear();
    SeedRunner.clear();
    NotificationQueue.clear();
    if (fs.existsSync(testStorageDir)) {
      fs.rmSync(testStorageDir, { recursive: true, force: true });
    }
  });

  it("should execute the complete infrastructure pipeline seamlessly", async () => {
    // 1. Configuration Builder Initialization
    const builder = new ConfigurationBuilder();
    builder.addProvider(new JsonConfigurationProvider({
      "database.connectionstring": "postgresql://mock:5432/acos",
      "database.poolsize": "15",
      "security.jwtsecret": "extremely-secure-random-jwt-secret-key-32-chars-long",
      "app.environment": "development"
    }));
    const configSnapshot = builder.build();
    expect(configSnapshot.database.poolSize).toBe(15);

    // 2. Dependency Injection Container Registration & Resolution
    container.register("IConfiguration", () => configSnapshot, Lifetime.SINGLETON);
    const resolvedConfig = container.resolve<any>("IConfiguration");
    expect(resolvedConfig.database.connectionString).toBe("postgresql://mock:5432/acos");

    // 3. Database Schema Migrations Execution
    const migrations = [new InitialSchemaMigration(), new AddIndexesMigration()];
    const migrationRunner = new MigrationRunner(migrations);
    await migrationRunner.runPending();
    expect(MigrationHistory.getApplied().length).toBe(2);

    // 4. Data Seeding Setup
    await SeedRunner.seedAll();
    expect(SeedRunner.getAppliedSeeds()).toContain("currencies");
    expect(SeedRunner.getAppliedSeeds()).toContain("roles");

    // 5. Binary File Storage Upload & Download
    const storageProvider = new LocalStorageProvider(testStorageDir);
    const uploadManager = new UploadManager(storageProvider);
    const downloadManager = new DownloadManager(storageProvider);

    const payload = Buffer.from("E2E Integration Binary Document Payload");
    const sha256Hash = ChecksumCalculator.calculateSha256(payload);

    const uploadRes = await uploadManager.uploadWithVerification("invoices/inv-001.pdf", payload, sha256Hash);
    expect(uploadRes.isSuccess).toBe(true);

    const downloadRes = await downloadManager.downloadAndVerify("invoices/inv-001.pdf", sha256Hash);
    expect(downloadRes.isSuccess).toBe(true);
    expect(downloadRes.value.toString()).toBe("E2E Integration Binary Document Payload");

    // 6. Blockchain Confirmations Verification
    const walletProvider = new MockWalletProvider();
    const depositAddrRes = await walletProvider.generateDepositAddress("user-555", "USDC");
    expect(depositAddrRes.isSuccess).toBe(true);

    const transferRes = await walletProvider.transfer("0xsource", depositAddrRes.value, 1500.0, "USDC");
    expect(transferRes.isSuccess).toBe(true);

    const tracker = new ConfirmationTracker();
    const verifier = new SettlementVerifier(tracker);
    const txHash = transferRes.value;

    tracker.registerTransaction(txHash);
    for (let i = 0; i < 12; i++) {
      tracker.incrementConfirmations(txHash);
    }
    const verifiedRes = verifier.verifySettlement(txHash, 12);
    expect(verifiedRes.isSuccess).toBe(true);
    expect(verifiedRes.value).toBe(true);

    // 7. Notification Event Queue Dispatching
    const emailProvider = new SmtpEmailProvider("localhost", 587, false);
    const smsProvider = new TwilioSmsProvider("sid", "tok", "+123");
    
    const sendSpy = vi.spyOn(emailProvider, "send").mockResolvedValue(Result.ok());
    const emailChannel = new EmailChannel(emailProvider);
    const smsChannel = new SmsChannel(smsProvider);
    const dispatcher = new NotificationDispatcher(emailChannel, smsChannel);

    NotificationQueue.enqueue("email", {
      to: "merchant@acos.io",
      subject: "Settlement Confirmed",
      template: "Settlement of {{amount}} is final on address {{address}}.",
      variables: { amount: "$1,500.00", address: depositAddrRes.value }
    });

    await dispatcher.processPending();
    expect(NotificationQueue.getPending().length).toBe(0);
    expect(sendSpy).toHaveBeenCalledTimes(1);

    // 8. Observability Logging Format Verification
    const logTime = new Date();
    const logLine = TextFormatter.format({
      timestamp: logTime,
      level: "INFO",
      message: "Infrastructure E2E flow executed successfully.",
      context: { moduleName: "Integration" }
    });
    expect(logLine).toContain("INFO");
    expect(logLine).toContain("[Integration]");
    expect(logLine).toContain("Infrastructure E2E flow executed successfully.");
  });
});

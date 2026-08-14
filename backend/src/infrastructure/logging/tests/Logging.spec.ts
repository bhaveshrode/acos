import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LogEntry } from "../../../foundation/logging/LogEntry.js";
import { LogLevel } from "../../../foundation/logging/LogLevel.js";
import { LogContext } from "../../../foundation/logging/LogContext.js";
import { JsonFormatter } from "../formatters/JsonFormatter.js";
import { TextFormatter } from "../formatters/TextFormatter.js";
import { MinimumLevelFilter } from "../filters/MinimumLevelFilter.js";
import { LogEnricher } from "../enrichers/LogEnricher.js";
import { LogRouter } from "../routing/LogRouter.js";
import { CompositeLogWriter } from "../writers/CompositeLogWriter.js";
import { LoggingFactory } from "../factories/LoggingFactory.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";
import { LoggerFactory } from "../../../foundation/logging/LoggerFactory.js";

describe("Logging Infrastructure Layer Tests (Task 31.6)", () => {
  const testEntry = new LogEntry({
    level: LogLevel.INFO,
    message: "Test message log",
    context: new LogContext({ moduleName: "Billing", correlationId: "12345" })
  });

  beforeEach(() => {
    LoggerFactory.reset();
  });

  afterEach(() => {
    LoggerFactory.reset();
  });

  describe("Formatters", () => {
    it("should format LogEntry as a structured JSON payload", () => {
      const formatted = JsonFormatter.format(testEntry);
      const parsed = JSON.parse(formatted);

      expect(parsed.message).toBe("Test message log");
      expect(parsed.level).toBe("INFO");
      expect(parsed.moduleName).toBe("Billing");
      expect(parsed.correlationId).toBe("12345");
      expect(parsed.timestamp).toBeDefined();
    });

    it("should format LogEntry as human-readable plain text layout", () => {
      const formatted = TextFormatter.format(testEntry);
      expect(formatted).toContain("INFO");
      expect(formatted).toContain("[Billing]");
      expect(formatted).toContain("Test message log");
      expect(formatted).toContain("correlationId=12345");
    });
  });

  describe("MinimumLevelFilter", () => {
    it("should approve logs equal to or higher than threshold, rejecting lower ones", () => {
      const filter = new MinimumLevelFilter(LogLevel.WARN);

      expect(filter.shouldLog(LogLevel.TRACE)).toBe(false);
      expect(filter.shouldLog(LogLevel.DEBUG)).toBe(false);
      expect(filter.shouldLog(LogLevel.INFO)).toBe(false);
      expect(filter.shouldLog(LogLevel.WARN)).toBe(true);
      expect(filter.shouldLog(LogLevel.ERROR)).toBe(true);
      expect(filter.shouldLog(LogLevel.CRITICAL)).toBe(true);
    });
  });

  describe("LogEnricher", () => {
    it("should inject process PID and environment parameters into context", () => {
      const enriched = LogEnricher.enrich(testEntry);
      const data = enriched.context.additionalData;

      expect(data?.pid).toBe(process.pid);
      expect(data?.environment).toBeDefined();
      expect(data?.version).toBeDefined();
    });
  });

  describe("CompositeLogWriter & LogRouter", () => {
    it("should multiplex logs to all child writers via router when severity matches", () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      const composite = new CompositeLogWriter([spy1, spy2]);

      const filter = new MinimumLevelFilter(LogLevel.INFO);
      const router = new LogRouter(filter, composite.writer);

      router.route(testEntry);

      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy1.mock.calls[0][0].message).toBe("Test message log");
    });

    it("should block logs that fall below minimum level threshold in router", () => {
      const spy = vi.fn();
      const filter = new MinimumLevelFilter(LogLevel.WARN);
      const router = new LogRouter(filter, spy);

      router.route(testEntry); // testEntry is INFO, below WARN

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("LoggingFactory configureFrom", () => {
    it("should configure global LoggerFactory with min level routing", () => {
      const config = new ConfigurationSnapshot({
        app: { name: "ACOS-Logging-Test", version: "1.0.0", environment: "development", debug: false },
        database: { connectionString: "postgresql://localhost", poolSize: 5, timeoutSeconds: 10 },
        event: { provider: "in-memory", retryCount: 2, batchSize: 50, deadLetterEnabled: false },
        logging: { minLevel: "WARN", structuredLoggingEnabled: true },
        security: { jwtSecret: "sec", jwtExpirationSeconds: 10, issuer: "iss", passwordMinLength: 8 },
        payment: { settlementTimeoutSeconds: 10, defaultNetwork: "localhost", supportedCurrencies: ["USD"] },
        ai: { defaultModel: "gemini", temperature: 0.7, maxTokens: 2048, timeoutMs: 30000 }
      });

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      LoggingFactory.configureFrom(config);

      const logger = LoggerFactory.create("Security");
      logger.info("Should be skipped");
      logger.error("Should be logged to console");

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});

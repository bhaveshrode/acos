import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogLevel } from "./LogLevel.js";
import { LogContext } from "./LogContext.js";
import { LogEntry } from "./LogEntry.js";
import { Logger } from "./Logger.js";
import { LoggerFactory } from "./LoggerFactory.js";

describe("Logging Framework Unit Tests (Task 7.2)", () => {
  beforeEach(() => {
    LoggerFactory.reset();
  });

  describe("LogContext", () => {
    it("should initialize properties correctly", () => {
      const context = new LogContext({
        correlationId: "corr-1",
        userId: "user-2",
        moduleName: "Identity",
        additionalData: { environment: "test" }
      });

      expect(context.correlationId).toBe("corr-1");
      expect(context.userId).toBe("user-2");
      expect(context.moduleName).toBe("Identity");
      expect(context.additionalData).toEqual({ environment: "test" });
    });

    it("should merge contexts correctly, overriding matching fields and merging additionalData", () => {
      const parent = new LogContext({
        correlationId: "corr-1",
        userId: "user-1",
        additionalData: { role: "admin", ip: "127.0.0.1" }
      });

      const child = parent.merge({
        correlationId: "corr-2", // override
        additionalData: { ip: "10.0.0.1", region: "us" } // override and merge
      });

      expect(child.correlationId).toBe("corr-2");
      expect(child.userId).toBe("user-1"); // inherited
      expect(child.additionalData).toEqual({
        role: "admin",
        ip: "10.0.0.1",
        region: "us"
      });
    });
  });

  describe("LogEntry", () => {
    it("should instantiate correctly with valid parameters", () => {
      const context = LogContext.empty().merge({ userId: "u1" });
      const error = new Error("DB Crash");
      const entry = new LogEntry({
        level: LogLevel.ERROR,
        message: "Failed database connection",
        context,
        error
      });

      expect(entry.level).toBe(LogLevel.ERROR);
      expect(entry.message).toBe("Failed database connection");
      expect(entry.context).toBe(context);
      expect(entry.error).toBe(error);
      expect(entry.timestamp).toBeInstanceOf(Date);
    });

    it("should throw if level is missing or message is empty", () => {
      expect(() => new LogEntry({ level: null as any, message: "OK", context: LogContext.empty() })).toThrow();
      expect(() => new LogEntry({ level: LogLevel.INFO, message: "", context: LogContext.empty() })).toThrow("LogEntry message cannot be null or empty.");
      expect(() => new LogEntry({ level: LogLevel.INFO, message: "   ", context: LogContext.empty() })).toThrow("LogEntry message cannot be null or empty.");
    });
  });

  describe("Logger", () => {
    it("should dispatch correctly structured entries to the writer", () => {
      const entries: LogEntry[] = [];
      const writer = (e: LogEntry) => { entries.push(e); };
      const logger = new Logger("Invoice", writer);

      logger.info("Invoice processed successfully", { invoiceId: "inv_9" });

      expect(entries).toHaveLength(1);
      const entry = entries[0];
      expect(entry.level).toBe(LogLevel.INFO);
      expect(entry.message).toBe("Invoice processed successfully");
      expect(entry.context.moduleName).toBe("Invoice");
      expect(entry.context.additionalData).toEqual({ invoiceId: "inv_9" });
    });

    it("should support all log levels correctly", () => {
      const entries: LogEntry[] = [];
      const writer = (e: LogEntry) => { entries.push(e); };
      const logger = new Logger("Test", writer);

      logger.trace("Trace log");
      logger.debug("Debug log");
      logger.info("Info log");
      logger.warn("Warn log");
      const err = new Error("Err");
      logger.error("Error log", err);
      logger.critical("Critical log", err);

      expect(entries).toHaveLength(6);
      expect(entries[0].level).toBe(LogLevel.TRACE);
      expect(entries[1].level).toBe(LogLevel.DEBUG);
      expect(entries[2].level).toBe(LogLevel.INFO);
      expect(entries[3].level).toBe(LogLevel.WARN);
      expect(entries[4].level).toBe(LogLevel.ERROR);
      expect(entries[4].error).toBe(err);
      expect(entries[5].level).toBe(LogLevel.CRITICAL);
      expect(entries[5].error).toBe(err);
    });

    it("should support context inheritance via withContext()", () => {
      const entries: LogEntry[] = [];
      const writer = (e: LogEntry) => { entries.push(e); };
      
      const parentLogger = new Logger("Identity", writer, new LogContext({ correlationId: "flow-123" }));
      const childLogger = parentLogger.withContext({ userId: "usr_99" });

      childLogger.info("Login attempt");

      expect(entries).toHaveLength(1);
      const entry = entries[0];
      expect(entry.context.correlationId).toBe("flow-123"); // inherited
      expect(entry.context.userId).toBe("usr_99"); // merged child context
    });
  });

  describe("LoggerFactory", () => {
    it("should configure global writer and supply loggers that route to it", () => {
      const entries: LogEntry[] = [];
      const writer = (e: LogEntry) => { entries.push(e); };

      LoggerFactory.configure(writer, new LogContext({ correlationId: "glob-1" }));
      
      const logger = LoggerFactory.create("Payment");
      logger.info("Payment detected");

      expect(entries).toHaveLength(1);
      const entry = entries[0];
      expect(entry.context.moduleName).toBe("Payment");
      expect(entry.context.correlationId).toBe("glob-1"); // inherited from global configuration
    });

    it("should remain silent if not configured", () => {
      const logger = LoggerFactory.create("Silence");
      // Logging should not throw or print to output console
      expect(() => logger.info("Testing silence")).not.toThrow();
    });
  });
});

import crypto from "crypto";
import express from "express";
import { AsyncLocalStorage } from "async_hooks";
import { Logger, LogWriter } from "../../../../backend/src/foundation/logging/Logger.js";
import { LogEntry } from "../../../../backend/src/foundation/logging/LogEntry.js";
import { MerchantConfig } from "../configuration/MerchantConfig.js";

export const correlationLocalStorage = new AsyncLocalStorage<string>();
import { AcosIntegrationBoundary } from "../integration/AcosIntegrationBoundary.js";
import { MerchantEventConsumer } from "../events/consumers/MerchantEventConsumer.js";
import { MerchantRouter } from "./MerchantRouter.js";

export enum MerchantBackendState {
  STOPPED = "STOPPED",
  STARTING = "STARTING",
  RUNNING = "RUNNING",
  STOPPING = "STOPPING",
  FAILED = "FAILED"
}

export class MerchantBackend {
  private state: MerchantBackendState = MerchantBackendState.STOPPED;
  private readonly logger: Logger;
  private readonly invoiceCache = new Map<string, any>();
  private readonly dashboardCache = new Map<string, any>();
  public readonly eventConsumer: MerchantEventConsumer;
  private readonly app = express();
  private server: any = null;
  private readonly memoryIdempotency = new Map<string, { statusCode: number; responseBody: string }>();
  private readonly router: MerchantRouter;

  constructor(
    public readonly config: MerchantConfig,
    private readonly acosBoundary: AcosIntegrationBoundary,
    logWriter: LogWriter
  ) {
    const wrappedWriter: LogWriter = (entry) => {
      const correlationId = correlationLocalStorage.getStore();
      if (correlationId) {
        const modifiedEntry = new LogEntry({
          timestamp: entry.timestamp,
          level: entry.level,
          message: `[Correlation-ID: ${correlationId}] ${entry.message}`,
          context: entry.context,
          error: entry.error
        });
        logWriter(modifiedEntry);
      } else {
        logWriter(entry);
      }
    };

    this.logger = new Logger("MerchantBackend", wrappedWriter);
    if ((this.acosBoundary as any).logger) {
      const originalBoundaryLogger = (this.acosBoundary as any).logger;
      const originalWriter = originalBoundaryLogger.writer || originalBoundaryLogger.logWriter;
      if (originalWriter) {
        originalBoundaryLogger.writer = (e: any) => {
          const cid = correlationLocalStorage.getStore();
          if (cid) {
            const modifiedEntry = new LogEntry({
              timestamp: e.timestamp,
              level: e.level,
              message: `[Correlation-ID: ${cid}] ${e.message}`,
              context: e.context,
              error: e.error
            });
            originalWriter(modifiedEntry);
          } else {
            originalWriter(e);
          }
        };
      }
    }

    this.eventConsumer = new MerchantEventConsumer(
      this.acosBoundary.eventBus,
      (invoiceId) => this.invalidateInvoiceCache(invoiceId)
    );
    this.router = new MerchantRouter(
      this.acosBoundary,
      this.config,
      this.logger,
      this.invoiceCache,
      this.dashboardCache
    );
  }

  /**
   * Helper to invalidate cache for a specific invoice.
   */
  public invalidateInvoiceCache(invoiceId: string): void {
    this.logger.info("invalidateInvoiceCache: Invalidating cache for invoice", { invoiceId });
    this.invoiceCache.delete(invoiceId);
    this.dashboardCache.clear();
  }

  /**
   * Helper to check if an invoice is currently cached.
   */
  public isInvoiceCached(invoiceId: string): boolean {
    return this.invoiceCache.has(invoiceId);
  }

  /**
   * Helper to check if dashboard is currently cached.
   */
  public isDashboardCached(orgId: string): boolean {
    return this.dashboardCache.has(orgId);
  }

  /**
   * Helper to clear the entire cache (useful between tests).
   */
  public clearCache(): void {
    this.invoiceCache.clear();
    this.dashboardCache.clear();
    this.memoryIdempotency.clear();
  }

  private async getIdempotencyRecord(key: string): Promise<{ statusCode: number; responseBody: string } | null> {
    const prisma = (this.acosBoundary as any).prismaClient;
    if (prisma) {
      try {
        const record = await prisma.idempotencyRecord.findUnique({
          where: { key }
        });
        if (record) {
          return {
            statusCode: record.statusCode,
            responseBody: record.responseBody
          };
        }
      } catch (err: any) {
        this.logger.error("Failed to query idempotency record from PostgreSQL", err);
      }
    }
    return this.memoryIdempotency.get(key) || null;
  }

  private async saveIdempotencyRecord(key: string, statusCode: number, responseBody: string): Promise<void> {
    const prisma = (this.acosBoundary as any).prismaClient;
    if (prisma) {
      try {
        await prisma.idempotencyRecord.upsert({
          where: { key },
          create: { key, statusCode, responseBody },
          update: { statusCode, responseBody }
        });
        return;
      } catch (err: any) {
        this.logger.error("Failed to save idempotency record to PostgreSQL", err);
      }
    }
    this.memoryIdempotency.set(key, { statusCode, responseBody });
  }

  /**
   * Starts the Merchant Backend listener.
   */
  public async start(): Promise<void> {
    this.logger.info("Starting Merchant Backend...", { port: this.config.port });
    this.state = MerchantBackendState.STARTING;
    try {
      this.eventConsumer.subscribe();

      // Setup Express routes
      this.app.use(express.json());

      // Track 11.7: Correlation ID middleware
      this.app.use((req: any, res: any, next: any) => {
        const correlationId = (req.headers["x-correlation-id"] || req.headers["X-Correlation-ID"] || `corr_${crypto.randomUUID()}`) as string;
        res.setHeader("X-Correlation-ID", correlationId);
        correlationLocalStorage.run(correlationId, () => {
          next();
        });
      });

      this.app.use(async (req: any, res: any) => {
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(req.headers)) {
          if (typeof v === "string") {
            headers[k] = v;
          }
        }

        // Track 11.5: Check Idempotency-Key
        const idempotencyKey = headers["idempotency-key"] || headers["Idempotency-Key"];
        if (idempotencyKey && (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")) {
          const cached = await this.getIdempotencyRecord(idempotencyKey);
          if (cached) {
            this.logger.info("Serving cached response for idempotency key", { idempotencyKey });
            return res.status(cached.statusCode).json(JSON.parse(cached.responseBody));
          }
        }

        const response = await this.router.handleRequestInternal(req.method, req.path, req.body, headers);

        // Track 11.5: Save response under Idempotency-Key
        if (idempotencyKey && (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") && response.status < 500) {
          await this.saveIdempotencyRecord(idempotencyKey, response.status, JSON.stringify(response.body));
        }

        // Track 11.3: Set session cookie on successful authentication
        if (response.status === 200 && req.path === "/auth/login" && response.body && response.body.token) {
          res.setHeader("Set-Cookie", `session_token=${response.body.token}; HttpOnly; Path=/; SameSite=Lax`);
        } else if (response.status === 201 && req.path === "/auth/signup" && response.body && response.body.token) {
          res.setHeader("Set-Cookie", `session_token=${response.body.token}; HttpOnly; Path=/; SameSite=Lax`);
        } else if (req.path === "/auth/logout") {
          res.setHeader("Set-Cookie", `session_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
        }

        res.status(response.status).json(response.body);
      });

      // Start actual HTTP listener
      await new Promise<void>((resolve, reject) => {
        this.server = this.app.listen(this.config.port, () => {
          resolve();
        });
        this.server.on("error", reject);
      });

      this.state = MerchantBackendState.RUNNING;
      this.logger.info("Merchant Backend Express server is running.");
    } catch (err: any) {
      this.state = MerchantBackendState.FAILED;
      this.logger.error("Merchant Backend failed to start", err);
      throw err;
    }
  }

  /**
   * Stops the Merchant Backend listener.
   */
  public async stop(): Promise<void> {
    this.logger.info("Stopping Merchant Backend...");
    this.state = MerchantBackendState.STOPPING;
    
    if (this.server) {
      this.server.close();
      this.server = null;
    }

    this.eventConsumer.unsubscribe();
    this.state = MerchantBackendState.STOPPED;
    this.logger.info("Merchant Backend stopped.");
  }

  /**
   * Returns current operational state flag.
   */
  public getState(): MerchantBackendState {
    return this.state;
  }



  /**
   * Entrypoint for simulated HTTP/REST traffic routing.
   * Performs real HTTP fetch requests to the local Express server.
   */
  public async handleRequest(
    method: string,
    path: string,
    payload?: any,
    headers?: Record<string, string>
  ): Promise<{ status: number; body: any }> {
    if (this.state !== MerchantBackendState.RUNNING) {
      this.logger.warn("Request rejected: Server is not running.", { path, state: this.state });
      return {
        status: 503,
        body: { error: "Service Unavailable: Merchant Backend is offline." }
      };
    }

    if (path === "/payments/webhook" && (!headers || (!headers["Stripe-Signature"] && !headers["stripe-signature"]))) {
      const t = Math.floor(Date.now() / 1000).toString();
      const secret = this.config.stripeWebhookSecret;
      const signature = crypto
        .createHmac("sha256", secret)
        .update(`${t}.${JSON.stringify(payload)}`)
        .digest("hex");
      headers = {
        ...headers,
        "Stripe-Signature": `t=${t},v1=${signature}`
      };
    }

    const activeCorrelationId = correlationLocalStorage.getStore();
    const headersToSend = { ...headers };
    if (activeCorrelationId) {
      headersToSend["X-Correlation-ID"] = activeCorrelationId;
    } else if (!headersToSend["X-Correlation-ID"] && !headersToSend["x-correlation-id"]) {
      headersToSend["X-Correlation-ID"] = `corr_${crypto.randomUUID()}`;
    }

    const url = `http://localhost:${this.config.port}${path}`;
    const requestOptions: any = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headersToSend
      }
    };

    if (method !== "GET" && method !== "DELETE" && payload) {
      requestOptions.body = JSON.stringify(payload);
    }

    try {
      const response = await fetch(url, requestOptions);
      const text = await response.text();
      let body;
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { message: text };
      }
      return {
        status: response.status,
        body
      };
    } catch (err: any) {
      this.logger.error("handleRequest real HTTP call failed", err);
      return {
        status: 500,
        body: { error: "Internal Server Error", message: err.message }
      };
    }
  }
}

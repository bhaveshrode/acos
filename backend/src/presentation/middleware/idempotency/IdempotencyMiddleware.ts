import { IMiddleware } from "../IMiddleware.js";
import { MiddlewareContext } from "../MiddlewareContext.js";
import { IIdempotencyStore } from "./IIdempotencyStore.js";

/**
 * Platform-level generic Idempotency Middleware.
 * Intercepts POST/PUT/PATCH requests containing an 'Idempotency-Key' header,
 * serves cached responses from the store to avoid duplicate execution,
 * and saves successful responses automatically.
 */
export class IdempotencyMiddleware implements IMiddleware {
  constructor(private readonly store: IIdempotencyStore) {}

  /**
   * Custom ACOS presentation pipeline handler.
   */
  public async handle(context: MiddlewareContext, next: () => Promise<void>): Promise<void> {
    const { req, res } = context;
    const idempotencyKey = req.headers?.["idempotency-key"] || req.headers?.["Idempotency-Key"];

    if (idempotencyKey && (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")) {
      const cached = await this.store.get(idempotencyKey);
      if (cached) {
        // Short-circuit: write cached response and skip next()
        if (typeof res.status === "function") {
          res.status(cached.statusCode).json(JSON.parse(cached.responseBody));
        } else {
          res.status = cached.statusCode;
          res.body = JSON.parse(cached.responseBody);
        }
        return;
      }
    }

    // Capture standard response writing to record sent payload
    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody = "";

    if (originalJson) {
      res.json = function (body: any) {
        responseBody = JSON.stringify(body);
        return originalJson.call(this, body);
      };
    }

    if (originalSend) {
      res.send = function (body: any) {
        if (typeof body === "string") {
          responseBody = body;
        } else if (body instanceof Buffer) {
          responseBody = body.toString("utf8");
        }
        return originalSend.call(this, body);
      };
    }

    await next();

    // Fallback: If downstream did not use Express res.json/res.send (e.g. in test pipeline)
    if (!responseBody && res.body) {
      responseBody = typeof res.body === "string" ? res.body : JSON.stringify(res.body);
    }

    const statusCode = res.statusCode || res.status || 200;

    // Cache the response if it represents a success/client error (exclude 5xx server errors)
    if (
      idempotencyKey &&
      (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") &&
      statusCode < 500 &&
      responseBody
    ) {
      await this.store.save(idempotencyKey, statusCode, responseBody);
    }
  }

  /**
   * Helper factory returning a standard Express middleware function.
   */
  public toExpressMiddleware(): (req: any, res: any, next: any) => Promise<void> {
    return async (req: any, res: any, next: any) => {
      const context: MiddlewareContext = { req, res, state: {} };
      let calledNext = false;
      
      await this.handle(context, async () => {
        calledNext = true;
        next();
      });

      // If next wasn't called (short-circuited), res has already been sent, so do nothing.
    };
  }
}

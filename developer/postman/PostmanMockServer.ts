import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PostmanMockServer {
  private isRunning: boolean = false;
  private validApiKey: string = "acos_sec_test_key_12345";

  constructor() {
    this.loadEnv();
  }

  private loadEnv(): void {
    try {
      const p = path.join(__dirname, "acos_env.json");
      if (fs.existsSync(p)) {
        const env = JSON.parse(fs.readFileSync(p, "utf-8"));
        const apiKeyVal = env.values.find((v: any) => v.key === "api_key");
        if (apiKeyVal) {
          this.validApiKey = apiKeyVal.value;
        }
      }
    } catch {
      // Keep fallback
    }
  }

  public start(): void {
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public getStatus(): boolean {
    return this.isRunning;
  }

  public async simulateRequest(
    method: string,
    endpoint: string,
    headers: Record<string, string>,
    body: any
  ): Promise<{ status: number; body: any }> {
    if (!this.isRunning) {
      throw new Error("Postman Mock Server is not running.");
    }

    const authHeader = headers["Authorization"] || headers["authorization"];
    if (!authHeader || authHeader !== `Bearer ${this.validApiKey}`) {
      return {
        status: 401,
        body: { error: "Unauthorized: Invalid or missing API key in Authorization header." }
      };
    }

    const cleanEndpoint = endpoint.trim().toLowerCase();
    if (cleanEndpoint.includes("/invoices") && method.toUpperCase() === "POST") {
      if (!body.customerId || !body.organizationId) {
        return {
          status: 400,
          body: { error: "Bad Request: Missing customerId or organizationId" }
        };
      }
      return {
        status: 200,
        body: { isSuccess: true, invoiceId: "mock_inv_9999", message: "Mock Invoice Created via Postman Collection" }
      };
    }

    if (cleanEndpoint.includes("/payments/refund") && method.toUpperCase() === "POST") {
      if (!body.paymentId || !body.amount) {
        return {
          status: 400,
          body: { error: "Bad Request: Missing paymentId or amount" }
        };
      }
      return {
        status: 200,
        body: { isSuccess: true, refundId: "mock_ref_8888", message: "Mock Refund processed via Postman Mock Server" }
      };
    }

    return {
      status: 404,
      body: { error: `Endpoint ${endpoint} not found in Mock Server` }
    };
  }
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class OpenAPIGenerator {
  private getFilePath(...paths: string[]): string {
    return path.join(__dirname, ...paths);
  }

  public getOpenAPISpec(): Record<string, any> {
    try {
      const p = this.getFilePath("openapi.json");
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      }
    } catch {
      // Fallback
    }
    return { openapi: "3.0.3", info: { title: "ACOS Core API" } };
  }

  public renderSwaggerHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>ACOS API Swagger UI</title></head>
        <body>
          <div id="swagger-ui">Swagger UI Playground Container</div>
        </body>
      </html>
    `;
  }

  public renderRedocHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>ACOS API Redoc UI</title></head>
        <body>
          <div id="redoc">Redoc API Explorer Container</div>
        </body>
      </html>
    `;
  }

  public generateJsonSchema(modelName: string): Record<string, any> {
    const cleanName = modelName.trim().toLowerCase();
    let filename = "";
    if (cleanName === "invoice") {
      filename = "InvoiceSchema.json";
    } else if (cleanName === "payment" || cleanName === "paymentrefund") {
      filename = "PaymentSchema.json";
    }

    if (filename) {
      try {
        const p = this.getFilePath("schemas", filename);
        if (fs.existsSync(p)) {
          return JSON.parse(fs.readFileSync(p, "utf-8"));
        }
      } catch {
        // Fallback
      }
    }

    return { type: "object", properties: {} };
  }
}

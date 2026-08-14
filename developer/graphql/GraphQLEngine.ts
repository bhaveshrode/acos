import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolvers } from "./resolvers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GraphQLEngine {
  public getSchema(): string {
    try {
      const p = path.join(__dirname, "schema.graphql");
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, "utf-8");
      }
    } catch {
      // Fallback
    }
    return "type Query { hello: String }";
  }

  public getFederationSpecs(): string {
    return 'type Query { _service: _Service! } type _Service { sdl: String }';
  }

  public async execute(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<{ data?: any; errors?: any[] }> {
    const cleanQuery = query.replace(/\s+/g, " ").trim();

    if (cleanQuery.includes("mutation CreateInvoice") || cleanQuery.includes("createInvoice")) {
      const org = variables.organizationId || "org_default";
      const cust = variables.customerId || "cust_default";
      const num = variables.invoiceNumber || "inv_default";
      const cur = variables.currency || "USD";
      const total = variables.grandTotal || 0.0;
      const res = resolvers.Mutation.createInvoice(null, {
        organizationId: org,
        customerId: cust,
        invoiceNumber: num,
        currency: cur,
        grandTotal: total
      });
      return { data: { createInvoice: res } };
    }

    if (cleanQuery.includes("query GetInvoice") || cleanQuery.includes("getInvoice")) {
      const id = variables.id || "inv_123";
      const res = resolvers.Query.getInvoice(null, { id });
      return { data: { getInvoice: res } };
    }

    if (cleanQuery.includes("mutation RefundPayment") || cleanQuery.includes("refundPayment")) {
      const payId = variables.paymentId || "pay_default";
      const amt = variables.amount || 0.0;
      const res = resolvers.Mutation.refundPayment(null, { paymentId: payId, amount: amt });
      return { data: { refundPayment: res } };
    }

    return {
      errors: [{ message: `Query execution failed or unsupported query: ${query}` }]
    };
  }
}

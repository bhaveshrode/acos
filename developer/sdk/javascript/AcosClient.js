/**
 * AcosClient JavaScript client SDK wrapper.
 */
export class AcosClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.acos.io/v1";
  }

  static init(config) {
    if (!config.apiKey) throw new Error("API Key is required.");
    return new AcosClient(config);
  }

  get invoices() {
    return {
      create: async (data) => ({ isSuccess: true, invoiceId: "js-inv-123", data })
    };
  }

  get payments() {
    return {
      refund: async (id, amt) => ({ isSuccess: true, refundId: "js-ref-123", amount: amt })
    };
  }
}

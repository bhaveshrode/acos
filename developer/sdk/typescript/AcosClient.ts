export interface AcosClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export class AcosClient {
  private apiKey: string = "";
  private baseUrl: string = "https://api.acos.io/v1";

  private constructor(config: AcosClientConfig) {
    this.apiKey = config.apiKey;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  public static init(config: AcosClientConfig): AcosClient {
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new Error("API Key is required to initialize ACOS Client SDK.");
    }
    return new AcosClient(config);
  }

  public get auth() {
    return {
      login: async (apiKey: string): Promise<boolean> => {
        return apiKey === this.apiKey;
      }
    };
  }

  public get invoices() {
    return {
      create: async (invoiceData: any): Promise<{ isSuccess: boolean; invoiceId: string; data: any }> => {
        if (!invoiceData.customerId || !invoiceData.organizationId) {
          throw new Error("Missing required customerId or organizationId");
        }
        return {
          isSuccess: true,
          invoiceId: `inv_${Math.floor(Math.random() * 1000000)}`,
          data: invoiceData
        };
      }
    };
  }

  public get payments() {
    return {
      refund: async (paymentId: string, amount: number): Promise<{ isSuccess: boolean; refundId: string; amount: number }> => {
        if (amount <= 0) {
          throw new Error("Amount must be greater than zero.");
        }
        return {
          isSuccess: true,
          refundId: `ref_${Math.floor(Math.random() * 1000000)}`,
          amount
        };
      }
    };
  }
}

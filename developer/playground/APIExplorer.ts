export class APIExplorer {
  public async sendRequest(method: string, endpoint: string, body: any): Promise<{ status: number; data: any }> {
    const cleanEndpoint = endpoint.trim().toLowerCase();
    
    if (cleanEndpoint.includes("/invoices") && method.toUpperCase() === "POST") {
      if (!body.customerId || !body.organizationId) {
        return { status: 400, data: { error: "Missing required fields" } };
      }
      return {
        status: 200,
        data: {
          isSuccess: true,
          invoiceId: "inv_explorer_123",
          organizationId: body.organizationId,
          customerId: body.customerId,
          grandTotal: body.grandTotal || 0.0,
          status: "DRAFT"
        }
      };
    }

    if (cleanEndpoint.includes("/payments/refund") && method.toUpperCase() === "POST") {
      if (!body.paymentId || !body.amount) {
        return { status: 400, data: { error: "Missing required fields" } };
      }
      return {
        status: 200,
        data: {
          isSuccess: true,
          refundId: "ref_explorer_456",
          paymentId: body.paymentId,
          amount: body.amount,
          status: "COMPLETED"
        }
      };
    }

    return {
      status: 404,
      data: { error: `Endpoint ${endpoint} not found.` }
    };
  }
}

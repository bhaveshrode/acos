export interface WsClient {
  id: string;
  onMessage: (data: string) => void;
}

export class SandboxScenarios {
  private readonly wsClients = new Set<WsClient>();

  public async invokeStripeSandbox(paymentDetails: { amount: number; invoiceId: string }): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (paymentDetails.amount <= 0) {
      throw new Error("Stripe sandbox error: invalid amount");
    }
    return {
      status: "requires_action",
      checkoutUrl: `https://checkout.stripe.com/pay/mock_session_${Math.floor(Math.random() * 100000)}`,
      transactionId: `txn_stripe_${Date.now()}`
    };
  }

  public subscribeClient(client: WsClient): void {
    this.wsClients.add(client);
  }

  public unsubscribeClient(client: WsClient): void {
    this.wsClients.delete(client);
  }

  public broadcast(event: { type: string; payload: any }): number {
    let sentCount = 0;
    const packet = JSON.stringify(event);
    this.wsClients.forEach((client) => {
      client.onMessage(packet);
      sentCount++;
    });
    return sentCount;
  }
}

/**
 * Client class encapsulating JSON-RPC queries to simulated blockchain nodes.
 */
export class JsonRpcClient {
  constructor(private readonly endpoint: string) {}

  /**
   * Dispatches a simulated async request method to the RPC host.
   */
  public async call<T>(method: string, params: any[]): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (method === "eth_getBalance") {
          // Return simulated balance in hex Wei representation
          resolve("0xde0b6b3a7640000" as any);
        } else if (method === "eth_sendRawTransaction") {
          // Return simulated transaction hash
          resolve(("0x" + Math.random().toString(16).substring(2, 10)) as any);
        } else {
          resolve(true as any);
        }
      }, 10);
    });
  }
}

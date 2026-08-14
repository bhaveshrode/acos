import { JsonRpcClient } from "../clients/JsonRpcClient.js";

/**
 * Broadcaster class managing raw blockchain transaction publications via JSON-RPC.
 */
export class TransactionBroadcaster {
  constructor(private readonly rpcClient: JsonRpcClient) {}

  /**
   * Broadcasts a signed transaction hex payload, returning the blockchain transaction hash receipt.
   */
  public async broadcast(signedTxHex: string): Promise<string> {
    const txHash = await this.rpcClient.call<string>("eth_sendRawTransaction", [signedTxHex]);
    return txHash;
  }
}

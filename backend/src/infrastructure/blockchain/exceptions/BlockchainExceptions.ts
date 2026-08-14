/**
 * Base blockchain exception.
 */
export class BlockchainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockchainException";
  }
}

/**
 * Thrown when an RPC call fails.
 */
export class RpcException extends BlockchainException {
  constructor(method: string, details: string) {
    super(`RPC error calling '${method}': ${details}`);
    this.name = "RpcException";
  }
}

/**
 * Thrown when a broadcast transaction execution fails.
 */
export class TransactionFailedException extends BlockchainException {
  constructor(txHash: string, details: string) {
    super(`Blockchain transaction '${txHash}' failed to resolve: ${details}`);
    this.name = "TransactionFailedException";
  }
}

/**
 * Thrown when wallet parameters or balance lookups error.
 */
export class WalletException extends BlockchainException {
  constructor(address: string, details: string) {
    super(`Wallet error at address '${address}': ${details}`);
    this.name = "WalletException";
  }
}

/**
 * Thrown when confirmation finality times out.
 */
export class ConfirmationTimeoutException extends BlockchainException {
  constructor(txHash: string) {
    super(`Timed out waiting for block finality confirmations on transaction: ${txHash}`);
    this.name = "ConfirmationTimeoutException";
  }
}

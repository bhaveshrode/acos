/**
 * Enum representing reasons why a confirmed settlement might be reversed.
 */
export enum ReversalReason {
  CHAIN_REORGANIZATION = "CHAIN_REORGANIZATION",
  GATEWAY_ROLLBACK = "GATEWAY_ROLLBACK",
  TREASURY_FAILURE = "TREASURY_FAILURE",
  ADMINISTRATIVE = "ADMINISTRATIVE"
}

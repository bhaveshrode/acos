import { MapperBase } from "../common/MapperBase.js";

export interface RawSdkTxResponse {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  from: string;
  to: string;
}

export interface UnifiedReceipt {
  transactionHash: string;
  height: number;
  feePaid: number;
  sender: string;
  recipient: string;
}

/**
 * Mapper transforming provider-specific blockchain responses to unified transaction receipt contracts.
 */
export class TransactionMapper extends MapperBase<RawSdkTxResponse, UnifiedReceipt> {
  public map(source: RawSdkTxResponse): UnifiedReceipt {
    return {
      transactionHash: source.hash,
      height: source.blockNumber,
      feePaid: parseFloat(source.gasUsed || "0") * 0.0000001,
      sender: source.from,
      recipient: source.to
    };
  }
}

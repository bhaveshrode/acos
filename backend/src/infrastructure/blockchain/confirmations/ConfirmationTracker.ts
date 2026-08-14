/**
 * ConfirmationTracker class monitoring transaction block depths until absolute finality.
 */
export class ConfirmationTracker {
  private confirmations: Map<string, number> = new Map();

  /**
   * Registers a transaction hash inside the tracking repository.
   */
  public registerTransaction(txHash: string): void {
    this.confirmations.set(txHash, 0);
  }

  /**
   * Increments the confirmation depth counts of a transaction.
   */
  public incrementConfirmations(txHash: string): number {
    const current = this.confirmations.get(txHash) ?? 0;
    const next = current + 1;
    this.confirmations.set(txHash, next);
    return next;
  }

  /**
   * Retrieves the current confirmation depth.
   */
  public getConfirmations(txHash: string): number {
    return this.confirmations.get(txHash) ?? 0;
  }

  /**
   * Determines if block depth meets target finality thresholds (default EVM: 12 blocks).
   */
  public isFinal(txHash: string, requiredConfirmations: number = 12): boolean {
    return this.getConfirmations(txHash) >= requiredConfirmations;
  }
}

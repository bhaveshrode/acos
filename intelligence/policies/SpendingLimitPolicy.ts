export class SpendingLimitPolicy {
  constructor(public readonly limitAmount: number = 500.0) {}

  public check(amount: number): "ALLOW" | "DENY" | "HUMAN_APPROVAL_REQUIRED" {
    if (amount > this.limitAmount) {
      return "HUMAN_APPROVAL_REQUIRED";
    }
    return "ALLOW";
  }
}

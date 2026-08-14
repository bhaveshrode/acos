export class SpendingLimitPolicy {
    limitAmount;
    constructor(limitAmount = 500.0) {
        this.limitAmount = limitAmount;
    }
    check(amount) {
        if (amount > this.limitAmount) {
            return "HUMAN_APPROVAL_REQUIRED";
        }
        return "ALLOW";
    }
}

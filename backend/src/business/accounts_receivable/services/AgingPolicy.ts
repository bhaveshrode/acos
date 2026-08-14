import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";
import { AgingBucket } from "../value-objects/AgingBucket.js";
import { AgingCategory } from "../enums/AgingCategory.js";
import { Money } from "../../invoice/value-objects/Money.js";

/**
 * Domain Service responsible for calculating customer debt aging buckets.
 */
export class AgingPolicy {
  /**
   * Sorts unpaid receivable entries into aging buckets based on a given reference business date.
   */
  public calculateAgingBuckets(
    ar: AccountsReceivable,
    currentDate: Date,
    currency: string
  ): AgingBucket[] {
    let currentAmount = 0;
    let days1To30Amount = 0;
    let days31To60Amount = 0;
    let days61To90Amount = 0;
    let over90DaysAmount = 0;

    ar.entries.forEach((entry) => {
      if (entry.isPaid || entry.remainingBalance.currency !== currency) {
        return;
      }

      const diffTime = currentDate.getTime() - entry.dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        currentAmount += entry.remainingBalance.amount;
      } else if (diffDays <= 30) {
        days1To30Amount += entry.remainingBalance.amount;
      } else if (diffDays <= 60) {
        days31To60Amount += entry.remainingBalance.amount;
      } else if (diffDays <= 90) {
        days61To90Amount += entry.remainingBalance.amount;
      } else {
        over90DaysAmount += entry.remainingBalance.amount;
      }
    });

    return [
      AgingBucket.create(AgingCategory.CURRENT, Money.create(currentAmount, currency).value).value,
      AgingBucket.create(AgingCategory.DAYS_1_TO_30, Money.create(days1To30Amount, currency).value).value,
      AgingBucket.create(AgingCategory.DAYS_31_TO_60, Money.create(days31To60Amount, currency).value).value,
      AgingBucket.create(AgingCategory.DAYS_61_TO_90, Money.create(days61To90Amount, currency).value).value,
      AgingBucket.create(AgingCategory.OVER_90_DAYS, Money.create(over90DaysAmount, currency).value).value
    ];
  }
}

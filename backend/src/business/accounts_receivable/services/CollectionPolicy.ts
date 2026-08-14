import { AccountsReceivable } from "../aggregates/AccountsReceivable.js";

/**
 * Domain Service enforcing rules and triggers for collection activity transitions.
 */
export class CollectionPolicy {
  /**
   * Evaluates if the account is eligible for reminder notifications (overdue by >= 1 day).
   */
  public isEligibleForReminder(ar: AccountsReceivable, currentDate: Date): boolean {
    return ar.entries.some((entry) => {
      if (entry.isPaid) return false;
      const diffDays = (currentDate.getTime() - entry.dueDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 1;
    });
  }

  /**
   * Evaluates if the account should be escalated (overdue by >= 30 days).
   */
  public isEligibleForEscalation(ar: AccountsReceivable, currentDate: Date): boolean {
    return ar.entries.some((entry) => {
      if (entry.isPaid) return false;
      const diffDays = (currentDate.getTime() - entry.dueDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 30;
    });
  }

  /**
   * Evaluates if the account should undergo legal review (overdue by >= 90 days).
   */
  public isEligibleForLegalReview(ar: AccountsReceivable, currentDate: Date): boolean {
    return ar.entries.some((entry) => {
      if (entry.isPaid) return false;
      const diffDays = (currentDate.getTime() - entry.dueDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 90;
    });
  }
}

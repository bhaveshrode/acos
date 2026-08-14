import { Money } from "../../invoice/value-objects/Money.js";
/**
 * Domain Service determining credit matching policies.
 */
export class CreditAllocationPolicy {
    /**
     * Calculates FIFO matching of credits to outstanding invoices.
     * Matches oldest unapplied credits to oldest outstanding invoice entries first.
     */
    distributeCreditsFIFO(ar, currency) {
        const allocations = [];
        // Copy remaining balances to track locally during calculation
        const entryBalances = new Map();
        const creditBalances = new Map();
        // Unpaid entries sorted by due date (oldest first)
        const unpaidEntries = [...ar.entries]
            .filter((e) => !e.isPaid && e.remainingBalance.currency === currency)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        // Unapplied credits sorted by creation date (oldest first)
        const activeCredits = [...ar.customerCredits]
            .filter((c) => c.remainingBalance.amount > 0 && c.remainingBalance.currency === currency)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        unpaidEntries.forEach((e) => entryBalances.set(e.invoiceId.value, e.remainingBalance.amount));
        activeCredits.forEach((c) => creditBalances.set(c.id.value, c.remainingBalance.amount));
        for (const entry of unpaidEntries) {
            let entryRemaining = entryBalances.get(entry.invoiceId.value) || 0;
            for (const credit of activeCredits) {
                if (entryRemaining <= 0)
                    break;
                const creditRemaining = creditBalances.get(credit.id.value) || 0;
                if (creditRemaining <= 0)
                    continue;
                const applyAmount = Math.min(entryRemaining, creditRemaining);
                if (applyAmount > 0) {
                    allocations.push({
                        creditId: credit.id.value,
                        invoiceId: entry.invoiceId.value,
                        amount: Money.create(applyAmount, currency).value
                    });
                    entryRemaining -= applyAmount;
                    entryBalances.set(entry.invoiceId.value, entryRemaining);
                    creditBalances.set(credit.id.value, creditRemaining - applyAmount);
                }
            }
        }
        return allocations;
    }
}

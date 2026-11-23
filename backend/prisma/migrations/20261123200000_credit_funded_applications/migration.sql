-- AlterTable
-- An application records whether customer credit funded it. A refund returns
-- credit-funded applications first, so the money comes back from the invoice
-- the credit settled instead of the one the payment settled directly. Rows
-- written before this change keep the default 0.
ALTER TABLE "ReceivablePaymentApplication" ADD COLUMN     "fundedByCredit" BOOLEAN NOT NULL DEFAULT false;

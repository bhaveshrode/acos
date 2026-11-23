-- AlterTable
-- Overpayment credits record the payment that produced them and the invoice
-- whose application produced the excess, so a refund can return that payment's
-- unapplied money before re-opening any invoice obligation. Rows written
-- before this change keep NULL and are never consumed by a refund.
ALTER TABLE "ReceivableCredit" ADD COLUMN     "settlementId" TEXT,
ADD COLUMN     "invoiceId" TEXT;

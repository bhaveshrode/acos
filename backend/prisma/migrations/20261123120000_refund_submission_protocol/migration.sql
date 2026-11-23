-- AlterTable
-- Rows written under the reserve-before-submit protocol carry 1; rows left at
-- the default 0 predate it and are never auto-released by the stale sweep.
ALTER TABLE "Refund" ADD COLUMN     "submissionProtocol" INTEGER NOT NULL DEFAULT 0;

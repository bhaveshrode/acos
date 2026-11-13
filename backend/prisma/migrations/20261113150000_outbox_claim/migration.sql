-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "lockedBy" TEXT,
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

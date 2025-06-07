-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "channel" TEXT,
ADD COLUMN     "msisdn" TEXT,
ALTER COLUMN "fee" SET DEFAULT 0;

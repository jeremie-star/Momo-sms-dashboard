-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "txId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER,
    "counterparty" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "rawBody" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txId_key" ON "Transaction"("txId");

-- CreateTable
CREATE TABLE "User" (
    "address" TEXT NOT NULL,
    "twitterUsername" TEXT,
    "twitterPfpUrl" TEXT,
    "profileChecked" BOOLEAN NOT NULL DEFAULT false,
    "supply" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Trade" (
    "hash" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "subjectAddress" TEXT NOT NULL,
    "isBuy" BOOLEAN NOT NULL,
    "amount" INTEGER NOT NULL,
    "cost" DECIMAL(65,0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_hash_key" ON "Trade"("hash");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_fromAddress_fkey" FOREIGN KEY ("fromAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_subjectAddress_fkey" FOREIGN KEY ("subjectAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "ContractRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CONTRACT_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE 'CONTRACT_REQUEST_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'CONTRACT_REQUEST_REJECTED';

-- CreateTable
CREATE TABLE "contract_requests" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "proposedPrice" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "area" TEXT,
    "terms" TEXT,
    "status" "ContractRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractId" TEXT,

    CONSTRAINT "contract_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contract_requests_contractId_key" ON "contract_requests"("contractId");

-- CreateIndex
CREATE INDEX "contract_requests_buyerId_idx" ON "contract_requests"("buyerId");

-- CreateIndex
CREATE INDEX "contract_requests_farmerId_idx" ON "contract_requests"("farmerId");

-- CreateIndex
CREATE INDEX "contract_requests_status_idx" ON "contract_requests"("status");

-- AddForeignKey
ALTER TABLE "contract_requests" ADD CONSTRAINT "contract_requests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_requests" ADD CONSTRAINT "contract_requests_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_requests" ADD CONSTRAINT "contract_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_requests" ADD CONSTRAINT "contract_requests_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

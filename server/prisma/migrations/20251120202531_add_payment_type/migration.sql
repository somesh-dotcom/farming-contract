-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ADVANCE', 'PARTIAL', 'FINAL', 'REFUND', 'OTHER');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "paymentType" "PaymentType";

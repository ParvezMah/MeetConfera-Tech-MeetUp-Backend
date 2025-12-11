/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transectionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "paymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "participants_paymentId_key" ON "participants"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transectionId_key" ON "payments"("transectionId");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

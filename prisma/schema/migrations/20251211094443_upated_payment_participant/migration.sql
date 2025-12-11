/*
  Warnings:

  - You are about to drop the column `paymentId` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transectionId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `payments` table. All the data in the column will be lost.
  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[participantId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gatewayName` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentGatewayProvider" AS ENUM ('STRIPE', 'SSLCOMMERZ');

-- DropForeignKey
ALTER TABLE "public"."participants" DROP CONSTRAINT "participants_paymentId_fkey";

-- DropIndex
DROP INDEX "public"."participants_paymentId_key";

-- DropIndex
DROP INDEX "public"."payments_transectionId_key";

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "paymentId";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "createdAt",
DROP COLUMN "transectionId",
DROP COLUMN "updatedAt",
ADD COLUMN     "gatewayData" JSONB,
ADD COLUMN     "gatewayName" "PaymentGatewayProvider" NOT NULL,
ADD COLUMN     "participantId" TEXT NOT NULL,
ADD COLUMN     "transactionId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "payments_participantId_key" ON "payments"("participantId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

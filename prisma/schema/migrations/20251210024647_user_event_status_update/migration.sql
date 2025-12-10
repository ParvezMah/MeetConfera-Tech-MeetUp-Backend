/*
  Warnings:

  - The `status` column on the `user_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserEventStatus" AS ENUM ('JOINED', 'CANCELLED', 'REJECTED', 'WAITING');

-- AlterTable
ALTER TABLE "user_events" DROP COLUMN "status",
ADD COLUMN     "status" "UserEventStatus" NOT NULL DEFAULT 'JOINED';

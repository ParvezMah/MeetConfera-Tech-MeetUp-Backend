/*
  Warnings:

  - The `status` column on the `participants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interests` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "participantStatus" AS ENUM ('JOINED', 'CANCELLED', 'REJECTED', 'WAITING');

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "status",
ADD COLUMN     "status" "participantStatus" NOT NULL DEFAULT 'JOINED';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "interests",
ADD COLUMN     "interests" "EventCategory";

-- DropEnum
DROP TYPE "public"."UserEventStatus";

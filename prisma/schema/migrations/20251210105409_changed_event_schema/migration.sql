/*
  Warnings:

  - The values [CLOSED,RUNNING] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `title` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `user_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `eventName` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minParticipants` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('AI', 'MACHINE_LEARNING', 'DATA_SCIENCE', 'WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'CLOUD_COMPUTING', 'CYBER_SECURITY', 'BLOCKCHAIN', 'DEVOPS', 'GAMING', 'ROBOTICS', 'STARTUPS', 'IOT', 'SOFTWARE_ENGINEERING', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('OPEN', 'FULLED', 'CANCELED', 'COMPLETED');
ALTER TABLE "public"."events" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "events" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "public"."EventStatus_old";
ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."user_events" DROP CONSTRAINT "user_events_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_events" DROP CONSTRAINT "user_events_userId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "title",
ADD COLUMN     "eventName" TEXT NOT NULL,
ADD COLUMN     "joiningFee" INTEGER,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "minParticipants" INTEGER NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "EventCategory" NOT NULL;

-- DropTable
DROP TABLE "public"."user_events";

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "UserEventStatus" NOT NULL DEFAULT 'JOINED',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

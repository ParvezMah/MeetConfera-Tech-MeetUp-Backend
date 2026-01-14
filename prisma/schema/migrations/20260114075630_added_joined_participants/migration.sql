/*
  Warnings:

  - Added the required column `joinedParticipants` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "joinedParticipants" INTEGER NOT NULL;

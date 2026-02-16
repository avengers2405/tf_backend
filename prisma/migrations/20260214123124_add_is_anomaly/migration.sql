/*
  Warnings:

  - Added the required column `pusher_name` to the `git_logbook_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "git_logbook_entries" ADD COLUMN     "anomaly_reason" TEXT,
ADD COLUMN     "is_anomaly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pusher_name" TEXT NOT NULL;

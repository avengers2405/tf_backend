/*
  Warnings:

  - You are about to drop the column `additions` on the `git_logbook_entries` table. All the data in the column will be lost.
  - You are about to drop the column `deletions` on the `git_logbook_entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "git_logbook_entries" DROP COLUMN "additions",
DROP COLUMN "deletions";

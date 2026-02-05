/*
  Warnings:

  - You are about to drop the column `repo_id` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Git_repo_project_association` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Git_repository` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[repo_url]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Git_repo_project_association" DROP CONSTRAINT "Git_repo_project_association_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Git_repo_project_association" DROP CONSTRAINT "Git_repo_project_association_repo_id_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_repo_id_fkey";

-- DropIndex
DROP INDEX "Project_repo_id_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "repo_id",
ADD COLUMN     "repo_url" TEXT;

-- DropTable
DROP TABLE "Git_repo_project_association";

-- DropTable
DROP TABLE "Git_repository";

-- CreateIndex
CREATE UNIQUE INDEX "Project_repo_url_key" ON "Project"("repo_url");

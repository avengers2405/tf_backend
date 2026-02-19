/*
  Warnings:

  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `group_id` column on the `Group` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Group_Teacher_Association` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `project_id` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Project_Group_Association` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Project_Phase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Student_Group_Association` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `group_id` on the `Group_Teacher_Association` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `project_id` on the `Project_Group_Association` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `group_id` on the `Project_Group_Association` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `project_id` on the `Project_Phase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `group_id` on the `Student_Group_Association` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `project_id` on the `git_logbook_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Group_Teacher_Association" DROP CONSTRAINT "Group_Teacher_Association_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_Group_Association" DROP CONSTRAINT "Project_Group_Association_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_Group_Association" DROP CONSTRAINT "Project_Group_Association_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_Phase" DROP CONSTRAINT "Project_Phase_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Student_Group_Association" DROP CONSTRAINT "Student_Group_Association_group_id_fkey";

-- DropForeignKey
ALTER TABLE "git_logbook_entries" DROP CONSTRAINT "git_logbook_entries_project_id_fkey";

-- AlterTable
ALTER TABLE "Group" DROP CONSTRAINT "Group_pkey",
DROP COLUMN "group_id",
ADD COLUMN     "group_id" SERIAL NOT NULL,
ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("group_id");

-- AlterTable
ALTER TABLE "Group_Teacher_Association" DROP CONSTRAINT "Group_Teacher_Association_pkey",
DROP COLUMN "group_id",
ADD COLUMN     "group_id" INTEGER NOT NULL,
ADD CONSTRAINT "Group_Teacher_Association_pkey" PRIMARY KEY ("teacher_id", "group_id");

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "project_id",
ADD COLUMN     "project_id" SERIAL NOT NULL,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id");

-- AlterTable
ALTER TABLE "Project_Group_Association" DROP CONSTRAINT "Project_Group_Association_pkey",
DROP COLUMN "project_id",
ADD COLUMN     "project_id" INTEGER NOT NULL,
DROP COLUMN "group_id",
ADD COLUMN     "group_id" INTEGER NOT NULL,
ADD CONSTRAINT "Project_Group_Association_pkey" PRIMARY KEY ("project_id", "group_id");

-- AlterTable
ALTER TABLE "Project_Phase" DROP CONSTRAINT "Project_Phase_pkey",
DROP COLUMN "project_id",
ADD COLUMN     "project_id" INTEGER NOT NULL,
ADD CONSTRAINT "Project_Phase_pkey" PRIMARY KEY ("phase_id", "project_id");

-- AlterTable
ALTER TABLE "Student_Group_Association" DROP CONSTRAINT "Student_Group_Association_pkey",
DROP COLUMN "group_id",
ADD COLUMN     "group_id" INTEGER NOT NULL,
ADD CONSTRAINT "Student_Group_Association_pkey" PRIMARY KEY ("student_id", "group_id");

-- AlterTable
ALTER TABLE "git_logbook_entries" DROP COLUMN "project_id",
ADD COLUMN     "project_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Project_Group_Association" ADD CONSTRAINT "Project_Group_Association_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Group_Association" ADD CONSTRAINT "Project_Group_Association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Phase" ADD CONSTRAINT "Project_Phase_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Group_Association" ADD CONSTRAINT "Student_Group_Association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_Teacher_Association" ADD CONSTRAINT "Group_Teacher_Association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_logbook_entries" ADD CONSTRAINT "git_logbook_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

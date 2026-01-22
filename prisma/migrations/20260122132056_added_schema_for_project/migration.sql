/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Phase_status" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Project_group_association" (
    "project_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "Project_group_association_pkey" PRIMARY KEY ("project_id","group_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technology_stack" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "current_phase_id" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Project_phase" (
    "phase_id" INTEGER NOT NULL,
    "project_id" TEXT NOT NULL,
    "phase_name" TEXT NOT NULL,
    "phase_description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "Phase_status" NOT NULL,
    "comments" TEXT,

    CONSTRAINT "Project_phase_pkey" PRIMARY KEY ("phase_id","project_id")
);

-- CreateTable
CREATE TABLE "Student_group" (
    "student_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "Student_group_pkey" PRIMARY KEY ("student_id","group_id")
);

-- CreateTable
CREATE TABLE "Group_teacher_association" (
    "teacher_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "Group_teacher_association_pkey" PRIMARY KEY ("teacher_id","group_id")
);

-- CreateTable
CREATE TABLE "git_logbook_entries" (
    "project_id" TEXT NOT NULL,
    "commit_id" TEXT NOT NULL,
    "commit_message" TEXT NOT NULL,
    "files_changed" INTEGER NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "difficulty_of_commit" INTEGER NOT NULL,
    "commit_timestamp" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "git_logbook_entries_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Git_repository" (
    "repo_id" TEXT NOT NULL,
    "repo_url" TEXT NOT NULL,

    CONSTRAINT "Git_repository_pkey" PRIMARY KEY ("repo_id")
);

-- CreateTable
CREATE TABLE "Git_repo_project_association" (
    "group_id" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,

    CONSTRAINT "Git_repo_project_association_pkey" PRIMARY KEY ("group_id","repo_id")
);

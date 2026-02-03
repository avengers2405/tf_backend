/*
  Warnings:

  - The primary key for the `Git_repo_project_association` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `git_logbook_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[repo_url]` on the table `Git_repository` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[repo_id]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commit_id]` on the table `git_logbook_entries` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `git_logbook_entries` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- AlterTable
ALTER TABLE "Git_repo_project_association" DROP CONSTRAINT "Git_repo_project_association_pkey",
ADD CONSTRAINT "Git_repo_project_association_pkey" PRIMARY KEY ("group_id");

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "repo_id" DROP NOT NULL,
ALTER COLUMN "current_phase_id" DROP NOT NULL;

-- AlterTable
CREATE SEQUENCE project_phase_phase_id_seq;
ALTER TABLE "Project_phase" ALTER COLUMN "phase_id" SET DEFAULT nextval('project_phase_phase_id_seq'),
ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "end_date" SET DATA TYPE DATE,
ALTER COLUMN "status" SET DEFAULT 'OPEN';
ALTER SEQUENCE project_phase_phase_id_seq OWNED BY "Project_phase"."phase_id";

-- AlterTable
ALTER TABLE "git_logbook_entries" DROP CONSTRAINT "git_logbook_entries_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "files_changed" SET DEFAULT 0,
ALTER COLUMN "additions" SET DEFAULT 0,
ALTER COLUMN "deletions" SET DEFAULT 0,
ALTER COLUMN "difficulty_of_commit" SET DEFAULT 1,
ADD CONSTRAINT "git_logbook_entries_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "registrationNumber" TEXT NOT NULL,
    "prnNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teRollNumber" TEXT NOT NULL,
    "beRollNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "secondaryEmail" TEXT,
    "studentEmail" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "currentAddress" JSONB NOT NULL,
    "permanentAddress" JSONB NOT NULL,
    "batch" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "xClass" DECIMAL(65,30),
    "xClassBoard" TEXT,
    "xClassPassingYear" INTEGER,
    "xGapYear" INTEGER NOT NULL DEFAULT 0,
    "xGapReason" TEXT,
    "xiiClass" DECIMAL(65,30),
    "xiiClassBoard" TEXT,
    "xiiClassPassingYear" INTEGER,
    "xiiGapYear" INTEGER NOT NULL DEFAULT 0,
    "xiiGapReason" TEXT,
    "diploma" DECIMAL(65,30),
    "diplomaUniversity" TEXT,
    "diplomaPassingYear" INTEGER,
    "diplomaGapYear" INTEGER NOT NULL DEFAULT 0,
    "diplomaGapReason" TEXT,
    "cetPercentile" DECIMAL(65,30),
    "jeePercentile" DECIMAL(65,30),
    "amcatMarks" DECIMAL(65,30),
    "amcatDetails" JSONB,
    "activeBacklog" INTEGER NOT NULL DEFAULT 0,
    "activeBacklogSem" TEXT,
    "passiveBacklog" INTEGER NOT NULL DEFAULT 0,
    "yd" BOOLEAN NOT NULL DEFAULT false,
    "aadharNumber" TEXT,
    "panNumber" TEXT,
    "passport" TEXT,
    "citizenship" TEXT,
    "higherEducationPlans" BOOLEAN NOT NULL DEFAULT false,
    "teFeeLink" TEXT,
    "beFeeLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("registrationNumber")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student_skill" (
    "studentRegistrationNumber" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "Student_skill_pkey" PRIMARY KEY ("studentRegistrationNumber","skillId")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "studentRegistrationNumber" TEXT NOT NULL,
    "name" TEXT,
    "documentType" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherRole" (
    "teacherId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherRole_pkey" PRIMARY KEY ("teacherId","roleId")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Group" (
    "group_id" TEXT NOT NULL,
    "group_name" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Student_prnNumber_key" ON "Student"("prnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_primaryEmail_key" ON "Student"("primaryEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Student_primaryPhone_key" ON "Student"("primaryPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "Teacher"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Git_repository_repo_url_key" ON "Git_repository"("repo_url");

-- CreateIndex
CREATE UNIQUE INDEX "Project_repo_id_key" ON "Project"("repo_id");

-- CreateIndex
CREATE UNIQUE INDEX "git_logbook_entries_commit_id_key" ON "git_logbook_entries"("commit_id");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_skill" ADD CONSTRAINT "Student_skill_studentRegistrationNumber_fkey" FOREIGN KEY ("studentRegistrationNumber") REFERENCES "Student"("registrationNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_skill" ADD CONSTRAINT "Student_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_studentRegistrationNumber_fkey" FOREIGN KEY ("studentRegistrationNumber") REFERENCES "Student"("registrationNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRole" ADD CONSTRAINT "TeacherRole_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRole" ADD CONSTRAINT "TeacherRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRole" ADD CONSTRAINT "TeacherRole_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_repo_id_fkey" FOREIGN KEY ("repo_id") REFERENCES "Git_repository"("repo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_phase" ADD CONSTRAINT "Project_phase_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_group" ADD CONSTRAINT "Student_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_group" ADD CONSTRAINT "Student_group_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("registrationNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_teacher_association" ADD CONSTRAINT "Group_teacher_association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_group_association" ADD CONSTRAINT "Project_group_association_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_group_association" ADD CONSTRAINT "Project_group_association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Git_repo_project_association" ADD CONSTRAINT "Git_repo_project_association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Git_repo_project_association" ADD CONSTRAINT "Git_repo_project_association_repo_id_fkey" FOREIGN KEY ("repo_id") REFERENCES "Git_repository"("repo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_logbook_entries" ADD CONSTRAINT "git_logbook_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

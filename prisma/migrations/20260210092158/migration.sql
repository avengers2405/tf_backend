/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `documentType` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `documentUrl` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `studentRegistrationNumber` on the `Document` table. All the data in the column will be lost.
  - The primary key for the `RolePermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permissionId` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `RolePermission` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aadharNumber` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `activeBacklog` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `activeBacklogSem` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `amcatDetails` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `amcatMarks` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `beFeeLink` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `beRollNumber` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `cetPercentile` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `currentAddress` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `diplomaGapReason` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `diplomaGapYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `diplomaPassingYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `diplomaUniversity` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `higherEducationPlans` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `jeePercentile` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `passiveBacklog` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `permanentAddress` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `primaryEmail` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `primaryPhone` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `prnNumber` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryEmail` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryPhone` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentEmail` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `teFeeLink` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `teRollNumber` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xClass` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xClassBoard` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xClassPassingYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xGapReason` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xGapYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xiiClass` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xiiClassBoard` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xiiClassPassingYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xiiGapReason` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `xiiGapYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Teacher` table. All the data in the column will be lost.
  - The primary key for the `TeacherRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignedAt` on the `TeacherRole` table. All the data in the column will be lost.
  - You are about to drop the column `assignedById` on the `TeacherRole` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `TeacherRole` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `TeacherRole` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Group_teacher_association` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project_group_association` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project_phase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student_group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student_skill` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[prn_number]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[primary_email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[primary_phone]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `document_description` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document_url` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_registration_number` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permission_id` to the `RolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `RolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `be_roll_number` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_address` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanent_address` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_email` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_phone` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prn_number` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_number` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_email` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `te_roll_number` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `TeacherRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `TeacherRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Phase_Status" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_studentRegistrationNumber_fkey";

-- DropForeignKey
ALTER TABLE "Group_teacher_association" DROP CONSTRAINT "Group_teacher_association_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_group_association" DROP CONSTRAINT "Project_group_association_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_group_association" DROP CONSTRAINT "Project_group_association_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_phase" DROP CONSTRAINT "Project_phase_project_id_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "Student_group" DROP CONSTRAINT "Student_group_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Student_group" DROP CONSTRAINT "Student_group_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Student_skill" DROP CONSTRAINT "Student_skill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "Student_skill" DROP CONSTRAINT "Student_skill_studentRegistrationNumber_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherRole" DROP CONSTRAINT "TeacherRole_assignedById_fkey";

-- DropForeignKey
ALTER TABLE "TeacherRole" DROP CONSTRAINT "TeacherRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherRole" DROP CONSTRAINT "TeacherRole_teacherId_fkey";

-- DropIndex
DROP INDEX "Student_primaryEmail_key";

-- DropIndex
DROP INDEX "Student_primaryPhone_key";

-- DropIndex
DROP INDEX "Student_prnNumber_key";

-- DropIndex
DROP INDEX "Student_userId_key";

-- DropIndex
DROP INDEX "Teacher_userId_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "createdAt",
DROP COLUMN "documentType",
DROP COLUMN "documentUrl",
DROP COLUMN "studentRegistrationNumber",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "document_description" JSONB NOT NULL,
ADD COLUMN     "document_url" TEXT NOT NULL,
ADD COLUMN     "student_registration_number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_pkey",
DROP COLUMN "permissionId",
DROP COLUMN "roleId",
ADD COLUMN     "permission_id" TEXT NOT NULL,
ADD COLUMN     "role_id" TEXT NOT NULL,
ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role_id", "permission_id");

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "aadharNumber",
DROP COLUMN "activeBacklog",
DROP COLUMN "activeBacklogSem",
DROP COLUMN "amcatDetails",
DROP COLUMN "amcatMarks",
DROP COLUMN "beFeeLink",
DROP COLUMN "beRollNumber",
DROP COLUMN "cetPercentile",
DROP COLUMN "createdAt",
DROP COLUMN "currentAddress",
DROP COLUMN "dateOfBirth",
DROP COLUMN "diplomaGapReason",
DROP COLUMN "diplomaGapYear",
DROP COLUMN "diplomaPassingYear",
DROP COLUMN "diplomaUniversity",
DROP COLUMN "firstName",
DROP COLUMN "higherEducationPlans",
DROP COLUMN "jeePercentile",
DROP COLUMN "lastName",
DROP COLUMN "middleName",
DROP COLUMN "panNumber",
DROP COLUMN "passiveBacklog",
DROP COLUMN "permanentAddress",
DROP COLUMN "primaryEmail",
DROP COLUMN "primaryPhone",
DROP COLUMN "prnNumber",
DROP COLUMN "registrationNumber",
DROP COLUMN "secondaryEmail",
DROP COLUMN "secondaryPhone",
DROP COLUMN "studentEmail",
DROP COLUMN "teFeeLink",
DROP COLUMN "teRollNumber",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
DROP COLUMN "xClass",
DROP COLUMN "xClassBoard",
DROP COLUMN "xClassPassingYear",
DROP COLUMN "xGapReason",
DROP COLUMN "xGapYear",
DROP COLUMN "xiiClass",
DROP COLUMN "xiiClassBoard",
DROP COLUMN "xiiClassPassingYear",
DROP COLUMN "xiiGapReason",
DROP COLUMN "xiiGapYear",
ADD COLUMN     "aadhar_number" TEXT,
ADD COLUMN     "active_backlog" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "active_backlog_sem" TEXT,
ADD COLUMN     "amcat_details" JSONB,
ADD COLUMN     "amcat_marks" DECIMAL(65,30),
ADD COLUMN     "be_fee_link" TEXT,
ADD COLUMN     "be_roll_number" TEXT NOT NULL,
ADD COLUMN     "cet_percentile" DECIMAL(65,30),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_address" JSONB NOT NULL,
ADD COLUMN     "date_of_birth" DATE NOT NULL,
ADD COLUMN     "diploma_gap_reason" TEXT,
ADD COLUMN     "diploma_gap_year" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "diploma_passing_year" INTEGER,
ADD COLUMN     "diploma_university" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "higher_education_plans" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jee_percentile" DECIMAL(65,30),
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "middle_name" TEXT,
ADD COLUMN     "pan_number" TEXT,
ADD COLUMN     "passive_backlog" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "permanent_address" JSONB NOT NULL,
ADD COLUMN     "primary_email" TEXT NOT NULL,
ADD COLUMN     "primary_phone" TEXT NOT NULL,
ADD COLUMN     "prn_number" TEXT NOT NULL,
ADD COLUMN     "registration_number" TEXT NOT NULL,
ADD COLUMN     "secondary_email" TEXT,
ADD COLUMN     "secondary_phone" TEXT,
ADD COLUMN     "student_email" TEXT NOT NULL,
ADD COLUMN     "te_fee_link" TEXT,
ADD COLUMN     "te_roll_number" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "x_class" DECIMAL(65,30),
ADD COLUMN     "x_class_board" TEXT,
ADD COLUMN     "x_class_passing_year" INTEGER,
ADD COLUMN     "x_gap_reason" TEXT,
ADD COLUMN     "x_gap_year" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xii_class" DECIMAL(65,30),
ADD COLUMN     "xii_class_board" TEXT,
ADD COLUMN     "xii_class_passing_year" INTEGER,
ADD COLUMN     "xii_gap_reason" TEXT,
ADD COLUMN     "xii_gap_year" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("registration_number");

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "isActive",
DROP COLUMN "lastName",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeacherRole" DROP CONSTRAINT "TeacherRole_pkey",
DROP COLUMN "assignedAt",
DROP COLUMN "assignedById",
DROP COLUMN "roleId",
DROP COLUMN "teacherId",
ADD COLUMN     "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "assigned_by_id" TEXT,
ADD COLUMN     "role_id" TEXT NOT NULL,
ADD COLUMN     "teacher_id" TEXT NOT NULL,
ADD CONSTRAINT "TeacherRole_pkey" PRIMARY KEY ("teacher_id", "role_id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Group_teacher_association";

-- DropTable
DROP TABLE "Project_group_association";

-- DropTable
DROP TABLE "Project_phase";

-- DropTable
DROP TABLE "Student_group";

-- DropTable
DROP TABLE "Student_skill";

-- DropEnum
DROP TYPE "Phase_status";

-- CreateTable
CREATE TABLE "Student_Skill_Association" (
    "student_registration_number" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "Student_Skill_Association_pkey" PRIMARY KEY ("student_registration_number","skill_id")
);

-- CreateTable
CREATE TABLE "CompanyDrive" (
    "drive_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "min_cgpa" DOUBLE PRECISION NOT NULL,
    "registration_deadline" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyDrive_pkey" PRIMARY KEY ("drive_id")
);

-- CreateTable
CREATE TABLE "DriveResponse" (
    "response_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "drive_id" TEXT NOT NULL,
    "is_interested" BOOLEAN DEFAULT false,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_token_hash" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "notification_sent_at" TIMESTAMP(3),

    CONSTRAINT "DriveResponse_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project_Group_Association" (
    "project_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "Project_Group_Association_pkey" PRIMARY KEY ("project_id","group_id")
);

-- CreateTable
CREATE TABLE "Project_Phase" (
    "phase_id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "phase_name" TEXT NOT NULL,
    "phase_description" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "Phase_Status" NOT NULL DEFAULT 'OPEN',
    "comments" TEXT,

    CONSTRAINT "Project_Phase_pkey" PRIMARY KEY ("phase_id","project_id")
);

-- CreateTable
CREATE TABLE "Student_Group_Association" (
    "student_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "Student_Group_Association_pkey" PRIMARY KEY ("student_id","group_id")
);

-- CreateTable
CREATE TABLE "Group_Teacher_Association" (
    "teacher_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "Group_Teacher_Association_pkey" PRIMARY KEY ("teacher_id","group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriveResponse_student_id_drive_id_key" ON "DriveResponse"("student_id", "drive_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_prn_number_key" ON "Student"("prn_number");

-- CreateIndex
CREATE UNIQUE INDEX "Student_user_id_key" ON "Student"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_primary_email_key" ON "Student"("primary_email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_primary_phone_key" ON "Student"("primary_phone");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_user_id_key" ON "Teacher"("user_id");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Skill_Association" ADD CONSTRAINT "Student_Skill_Association_student_registration_number_fkey" FOREIGN KEY ("student_registration_number") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Skill_Association" ADD CONSTRAINT "Student_Skill_Association_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_student_registration_number_fkey" FOREIGN KEY ("student_registration_number") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveResponse" ADD CONSTRAINT "DriveResponse_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveResponse" ADD CONSTRAINT "DriveResponse_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "CompanyDrive"("drive_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Group_Association" ADD CONSTRAINT "Project_Group_Association_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Group_Association" ADD CONSTRAINT "Project_Group_Association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Phase" ADD CONSTRAINT "Project_Phase_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Group_Association" ADD CONSTRAINT "Student_Group_Association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Group_Association" ADD CONSTRAINT "Student_Group_Association_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_Teacher_Association" ADD CONSTRAINT "Group_Teacher_Association_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRole" ADD CONSTRAINT "TeacherRole_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRole" ADD CONSTRAINT "TeacherRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRole" ADD CONSTRAINT "TeacherRole_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

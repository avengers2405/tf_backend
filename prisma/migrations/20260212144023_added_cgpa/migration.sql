-- CreateEnum
CREATE TYPE "Phase_Status" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "registration_number" TEXT NOT NULL,
    "prn_number" TEXT,
    "user_id" TEXT NOT NULL,
    "te_roll_number" TEXT,
    "be_roll_number" TEXT,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "first_name" TEXT,
    "middle_name" TEXT,
    "last_name" TEXT,
    "date_of_birth" DATE NOT NULL,
    "gender" "Gender",
    "primary_email" TEXT NOT NULL,
    "secondary_email" TEXT,
    "student_email" TEXT,
    "primary_phone" TEXT,
    "secondary_phone" TEXT,
    "current_address" JSONB,
    "permanent_address" JSONB,
    "batch" INTEGER,
    "department" TEXT,
    "x_class" DECIMAL(65,30),
    "x_class_board" TEXT,
    "x_class_passing_year" INTEGER,
    "x_gap_year" INTEGER DEFAULT 0,
    "x_gap_reason" TEXT,
    "xii_class" DECIMAL(65,30),
    "xii_class_board" TEXT,
    "xii_class_passing_year" INTEGER,
    "xii_gap_year" INTEGER DEFAULT 0,
    "xii_gap_reason" TEXT,
    "diploma" DECIMAL(65,30),
    "diploma_university" TEXT,
    "diploma_passing_year" INTEGER,
    "diploma_gap_year" INTEGER DEFAULT 0,
    "diploma_gap_reason" TEXT,
    "cet_percentile" DECIMAL(65,30),
    "jee_percentile" DECIMAL(65,30),
    "amcat_marks" DECIMAL(65,30),
    "amcat_details" JSONB,
    "active_backlog" INTEGER NOT NULL DEFAULT 0,
    "active_backlog_sem" TEXT,
    "passive_backlog" INTEGER NOT NULL DEFAULT 0,
    "yd" BOOLEAN NOT NULL DEFAULT false,
    "aadhar_number" TEXT,
    "pan_number" TEXT,
    "passport" TEXT,
    "citizenship" TEXT,
    "higher_education_plans" BOOLEAN NOT NULL DEFAULT false,
    "te_fee_link" TEXT,
    "be_fee_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("registration_number")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student_Skill_Association" (
    "student_registration_number" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "Student_Skill_Association_pkey" PRIMARY KEY ("student_registration_number","skill_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "student_registration_number" TEXT NOT NULL,
    "name" TEXT,
    "document_description" JSONB NOT NULL,
    "document_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Project" (
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technology_stack" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "repo_url" TEXT,
    "current_phase_id" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "Group" (
    "group_id" TEXT NOT NULL,
    "group_name" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("group_id")
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

-- CreateTable
CREATE TABLE "git_logbook_entries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "commit_id" TEXT NOT NULL,
    "commit_message" TEXT NOT NULL,
    "files_changed" INTEGER NOT NULL DEFAULT 0,
    "difficulty_of_commit" INTEGER NOT NULL DEFAULT 1,
    "commit_timestamp" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "git_logbook_entries_pkey" PRIMARY KEY ("id")
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
    "teacher_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_by_id" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherRole_pkey" PRIMARY KEY ("teacher_id","role_id")
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
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

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

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "Teacher"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DriveResponse_student_id_drive_id_key" ON "DriveResponse"("student_id", "drive_id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_repo_url_key" ON "Project"("repo_url");

-- CreateIndex
CREATE UNIQUE INDEX "git_logbook_entries_commit_id_key" ON "git_logbook_entries"("commit_id");

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
ALTER TABLE "git_logbook_entries" ADD CONSTRAINT "git_logbook_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

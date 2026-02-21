-- DropForeignKey
ALTER TABLE "Student_Skill_Association" DROP CONSTRAINT "Student_Skill_Association_student_registration_number_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "min_cgpa" DOUBLE PRECISION,
ADD COLUMN     "registration_deadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "skills" TEXT[];

-- CreateTable
CREATE TABLE "Temp" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Temp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group_Invitation" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stipend" TEXT,
    "duration" TEXT,
    "skills" TEXT[],
    "tags" TEXT[],
    "min_cgpa" DOUBLE PRECISION,
    "departments" TEXT[],
    "years" INTEGER[],
    "posted_by" TEXT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "applicants" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Group_Invitation" ADD CONSTRAINT "Group_Invitation_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_Invitation" ADD CONSTRAINT "Group_Invitation_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_Invitation" ADD CONSTRAINT "Group_Invitation_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "Student"("registration_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "Recruiter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

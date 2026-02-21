-- DropForeignKey
ALTER TABLE "Student_Skill_Association" DROP CONSTRAINT "Student_Skill_Association_student_registration_number_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "min_cgpa" DOUBLE PRECISION,
ADD COLUMN     "registration_deadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "skills" TEXT[];

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
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "Recruiter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

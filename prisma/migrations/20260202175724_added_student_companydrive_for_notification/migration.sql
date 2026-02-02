-- CreateTable
CREATE TABLE "Student_TNP" (
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_TNP_pkey" PRIMARY KEY ("student_id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Student_TNP_email_key" ON "Student_TNP"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DriveResponse_student_id_drive_id_key" ON "DriveResponse"("student_id", "drive_id");

-- AddForeignKey
ALTER TABLE "DriveResponse" ADD CONSTRAINT "DriveResponse_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student_TNP"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveResponse" ADD CONSTRAINT "DriveResponse_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "CompanyDrive"("drive_id") ON DELETE RESTRICT ON UPDATE CASCADE;

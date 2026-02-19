-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "supervisor_id" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

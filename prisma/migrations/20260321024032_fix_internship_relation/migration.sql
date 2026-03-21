-- DropForeignKey
ALTER TABLE "Internship" DROP CONSTRAINT "Internship_posted_by_fkey";

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

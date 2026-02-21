-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

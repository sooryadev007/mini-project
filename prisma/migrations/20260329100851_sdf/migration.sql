-- AlterTable
ALTER TABLE "application" ADD COLUMN     "answers" JSONB,
ADD COLUMN     "resume" TEXT;

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "customForm" JSONB;

-- AlterTable
ALTER TABLE "application" ADD COLUMN     "exceptionReason" TEXT,
ADD COLUMN     "isException" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationOtp" TEXT;

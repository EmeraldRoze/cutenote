-- AlterTable: change default for isPrivate to true
ALTER TABLE "User" ALTER COLUMN "isPrivate" SET DEFAULT true;

-- Update existing users to private
UPDATE "User" SET "isPrivate" = true WHERE "isPrivate" = false;

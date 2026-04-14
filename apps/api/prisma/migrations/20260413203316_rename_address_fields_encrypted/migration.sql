/*
  Warnings:

  - You are about to drop the column `city` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `line1` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `line2` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Address` table. All the data in the column will be lost.
  - Added the required column `encryptedCity` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedLine1` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedState` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedZip` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "line1",
DROP COLUMN "line2",
DROP COLUMN "state",
DROP COLUMN "zip",
ADD COLUMN     "encryptedCity" TEXT NOT NULL,
ADD COLUMN     "encryptedCountry" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "encryptedLine1" TEXT NOT NULL,
ADD COLUMN     "encryptedLine2" TEXT,
ADD COLUMN     "encryptedState" TEXT NOT NULL,
ADD COLUMN     "encryptedZip" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `MoloniAuth` table. All the data in the column will be lost.
  - Added the required column `accessExpiresAt` to the `MoloniAuth` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshExpiresAt` to the `MoloniAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MoloniAuth" DROP COLUMN "expiresAt",
ADD COLUMN     "accessExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refreshExpiresAt" TIMESTAMP(3) NOT NULL;

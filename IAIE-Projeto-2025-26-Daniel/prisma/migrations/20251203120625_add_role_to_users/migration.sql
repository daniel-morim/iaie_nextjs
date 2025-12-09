-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('user', 'employee', 'manager', 'admin');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'user';

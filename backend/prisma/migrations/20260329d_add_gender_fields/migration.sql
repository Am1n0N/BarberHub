-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ShopGender" AS ENUM ('MEN', 'WOMEN', 'UNISEX');

-- AlterTable: Add gender to User (optional)
ALTER TABLE "User" ADD COLUMN "gender" "Gender";

-- AlterTable: Add gender to Shop (default MEN)
ALTER TABLE "Shop" ADD COLUMN "gender" "ShopGender" NOT NULL DEFAULT 'MEN';

-- AlterTable: Add gender to ShopRequest (default MEN)
ALTER TABLE "ShopRequest" ADD COLUMN "gender" "ShopGender" NOT NULL DEFAULT 'MEN';

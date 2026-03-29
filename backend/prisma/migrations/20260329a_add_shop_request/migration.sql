-- CreateEnum ShopRequestStatus
CREATE TYPE "ShopRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable ShopRequest
CREATE TABLE "ShopRequest" (
    "id"          TEXT NOT NULL,
    "ownerName"   TEXT NOT NULL,
    "ownerPhone"  TEXT NOT NULL,
    "shopName"    TEXT NOT NULL,
    "address"     TEXT NOT NULL,
    "city"        TEXT NOT NULL,
    "message"     TEXT,
    "status"      "ShopRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote"  TEXT,
    "reviewedAt"  TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopRequest_pkey" PRIMARY KEY ("id")
);

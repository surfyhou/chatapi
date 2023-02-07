/*
  Warnings:

  - You are about to drop the column `api_key` on the `chatgpt_account` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "APIKeyStatus" AS ENUM ('Active', 'Overload', 'Error');

-- AlterTable
ALTER TABLE "chatgpt_account" DROP COLUMN "api_key";

-- CreateTable
CREATE TABLE "chatgpt_api_key" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "api_key" TEXT NOT NULL,
    "status" "APIKeyStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "chatgpt_api_key_pkey" PRIMARY KEY ("id")
);

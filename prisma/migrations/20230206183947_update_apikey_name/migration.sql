/*
  Warnings:

  - You are about to drop the column `apiKey` on the `chatgpt_account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chatgpt_account" DROP COLUMN "apiKey",
ADD COLUMN     "api_key" TEXT;

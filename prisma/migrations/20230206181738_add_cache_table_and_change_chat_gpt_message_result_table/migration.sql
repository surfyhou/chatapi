/*
  Warnings:

  - You are about to drop the `ChatGPTMessageResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ChatGPTMessageResult";

-- CreateTable
CREATE TABLE "chatgpt_message_result" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,

    CONSTRAINT "chatgpt_message_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatgpt_conversation_cache" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "chatgpt_conversation_cache_pkey" PRIMARY KEY ("key")
);

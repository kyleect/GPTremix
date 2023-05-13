/*
 Warnings:
 
 - You are about to drop the column `assistantId` on the `AssistantContextMessage` table. All the data in the column will be lost.
 - Added the required column `userId` to the `AssistantContextMessage` table without a default value. This is not possible if the table is not empty.
 
 */
-- CreateTable
CREATE TABLE "ContextMessagesOnAssistants" (
  "assistantId" TEXT NOT NULL,
  "contextMessageId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  PRIMARY KEY ("assistantId", "contextMessageId"),
  CONSTRAINT "ContextMessagesOnAssistants_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ContextMessagesOnAssistants_contextMessageId_fkey" FOREIGN KEY ("contextMessageId") REFERENCES "AssistantContextMessage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- Insert existing assistant/context message relationships
INSERT INTO ContextMessagesOnAssistants (assistantId, contextMessageId, updatedAt)
SELECT A.id,
  ACM.id,
  DATE('now')
FROM Assistant AS A
  JOIN AssistantContextMessage AS ACM ON A.id = ACM.assistantId;
-- RedefineTables
PRAGMA foreign_keys = OFF;
CREATE TABLE "new_AssistantContextMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  CONSTRAINT "AssistantContextMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Insert into new context message table
INSERT INTO "new_AssistantContextMessage" (
    "content",
    "createdAt",
    "id",
    "role",
    "updatedAt",
    "userId"
  )
SELECT ACM.content,
  ACM.createdAt,
  ACM.id,
  ACM.role,
  ACM.updatedAt,
  A.userId
FROM "AssistantContextMessage" AS ACM
  JOIN Assistant AS A ON ACM.assistantId = A.id;
-- Drop old table and rename new
DROP TABLE "AssistantContextMessage";
ALTER TABLE "new_AssistantContextMessage"
  RENAME TO "AssistantContextMessage";
-- Create index for context messages
CREATE UNIQUE INDEX "AssistantContextMessage_userId_role_content_key" ON "AssistantContextMessage"("userId", "role", "content");
PRAGMA foreign_key_check;
PRAGMA foreign_keys = ON;
-- CreateIndex
CREATE UNIQUE INDEX "ContextMessagesOnAssistants_assistantId_contextMessageId_key" ON "ContextMessagesOnAssistants"("assistantId", "contextMessageId");
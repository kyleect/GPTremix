-- CreateTable
CREATE TABLE "AssistantContextMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    CONSTRAINT "AssistantContextMessage_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

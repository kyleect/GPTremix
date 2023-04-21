/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Assistant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Assistant_userId_name_key" ON "Assistant"("userId", "name");
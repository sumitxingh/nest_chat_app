/*
  Warnings:

  - A unique constraint covering the columns `[conversation_id]` on the table `group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conversation_id` to the `group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_unique_id_fkey";

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "conversation_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "group_conversation_id_key" ON "group"("conversation_id");

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("unique_id") ON DELETE RESTRICT ON UPDATE CASCADE;

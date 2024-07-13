/*
  Warnings:

  - You are about to drop the `user_conversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_conversation" DROP CONSTRAINT "user_conversation_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "user_conversation" DROP CONSTRAINT "user_conversation_user_id_fkey";

-- DropTable
DROP TABLE "user_conversation";

-- CreateTable
CREATE TABLE "participants" (
    "id" SERIAL NOT NULL,
    "unique_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_unique_id_key" ON "participants"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_user_id_conversation_id_key" ON "participants"("user_id", "conversation_id");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("unique_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("unique_id") ON DELETE RESTRICT ON UPDATE CASCADE;

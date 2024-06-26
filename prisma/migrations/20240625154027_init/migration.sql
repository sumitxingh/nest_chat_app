-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "unique_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "full_name" TEXT,
    "profile_pic" TEXT,
    "password" TEXT NOT NULL,
    "refresh_token" TEXT,
    "email" TEXT NOT NULL,
    "reset_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_unique_id_key" ON "User"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

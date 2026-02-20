-- CreateTable
CREATE TABLE "Tnp" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tnp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tnp_user_id_key" ON "Tnp"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tnp_email_key" ON "Tnp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tnp_phone_key" ON "Tnp"("phone");

-- AddForeignKey
ALTER TABLE "Tnp" ADD CONSTRAINT "Tnp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

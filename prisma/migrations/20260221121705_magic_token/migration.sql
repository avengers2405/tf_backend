-- CreateTable
CREATE TABLE "Temp" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Temp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite_Magic_Token" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "created_by_user_id" TEXT,
    "custom_message" TEXT,
    "token_hash" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_Magic_Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_Magic_Token_token_hash_key" ON "Invite_Magic_Token"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_Magic_Token_jti_key" ON "Invite_Magic_Token"("jti");

-- AddForeignKey
ALTER TABLE "Invite_Magic_Token" ADD CONSTRAINT "Invite_Magic_Token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite_Magic_Token" ADD CONSTRAINT "Invite_Magic_Token_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

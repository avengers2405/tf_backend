-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Auth_Magic_Token" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auth_Magic_Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth_Session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auth_Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_Magic_Token_token_hash_key" ON "Auth_Magic_Token"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_Magic_Token_jti_key" ON "Auth_Magic_Token"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_Session_refresh_token_hash_key" ON "Auth_Session"("refresh_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_Session_jti_key" ON "Auth_Session"("jti");

-- AddForeignKey
ALTER TABLE "Auth_Magic_Token" ADD CONSTRAINT "Auth_Magic_Token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth_Session" ADD CONSTRAINT "Auth_Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

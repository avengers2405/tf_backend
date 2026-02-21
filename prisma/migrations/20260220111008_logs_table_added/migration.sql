-- CreateTable
CREATE TABLE "Logs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "identifier" TEXT,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "source" TEXT,
    "data" JSONB NOT NULL,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

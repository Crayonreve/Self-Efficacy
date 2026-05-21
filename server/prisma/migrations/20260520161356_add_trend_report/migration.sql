-- CreateTable
CREATE TABLE "trend_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trend_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trend_reports" ADD CONSTRAINT "trend_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

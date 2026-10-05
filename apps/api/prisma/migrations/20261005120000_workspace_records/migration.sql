CREATE TABLE "workspace_records" (
    "id" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_records_pkey" PRIMARY KEY ("collection", "id")
);

CREATE INDEX "workspace_records_collection_updatedAt_idx"
ON "workspace_records"("collection", "updatedAt");

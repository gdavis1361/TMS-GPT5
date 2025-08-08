-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Customer_ownerId_idx" ON "Customer"("ownerId");

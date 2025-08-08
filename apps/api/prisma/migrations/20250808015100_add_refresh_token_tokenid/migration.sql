-- Add tokenId column and unique index to RefreshToken
ALTER TABLE "RefreshToken" ADD COLUMN "tokenId" TEXT NOT NULL;
CREATE UNIQUE INDEX "RefreshToken_tokenId_key" ON "RefreshToken"("tokenId");

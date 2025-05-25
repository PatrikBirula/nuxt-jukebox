-- This is an empty migration.

-- CreateTable
CREATE TABLE "KaraokeTrack" (
  "id" TEXT NOT NULL,
  "trackUri" TEXT NOT NULL,
  "trackName" TEXT,
  "artistName" TEXT,
  "userId" TEXT NOT NULL,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isPlayed" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "KaraokeTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KaraokeTrack_trackUri_userId_key" ON "KaraokeTrack"("trackUri", "userId");

-- CreateIndex
CREATE INDEX "KaraokeTrack_userId_idx" ON "KaraokeTrack"("userId");

-- CreateIndex
CREATE INDEX "KaraokeTrack_trackUri_idx" ON "KaraokeTrack"("trackUri");

-- AddForeignKey
ALTER TABLE "KaraokeTrack" ADD CONSTRAINT "KaraokeTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
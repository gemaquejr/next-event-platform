-- AlterTable
ALTER TABLE "events" ADD COLUMN     "tmdbMovieId" INTEGER;

-- CreateIndex
CREATE INDEX "events_tmdbMovieId_idx" ON "events"("tmdbMovieId");

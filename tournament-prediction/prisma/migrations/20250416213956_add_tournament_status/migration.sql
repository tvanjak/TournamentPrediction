-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "status" "TournamentStatus" NOT NULL DEFAULT 'ONGOING';

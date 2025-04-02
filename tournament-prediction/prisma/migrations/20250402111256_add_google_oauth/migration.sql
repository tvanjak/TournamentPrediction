-- CreateEnum
CREATE TYPE "result_enum" AS ENUM ('homeWin', 'draw', 'awayWin');

-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('pending', 'finished');

-- CreateTable
CREATE TABLE "additional_group_rankings" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "team_id" INTEGER,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "additional_group_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "all_time_leaderboard" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "total_points" INTEGER DEFAULT 0,
    "average_points" DOUBLE PRECISION DEFAULT 0,
    "tournaments_played" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "all_time_leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elimination_games" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "team1_id" INTEGER,
    "team2_id" INTEGER,
    "winner_id" INTEGER,
    "status" "status_enum" DEFAULT 'pending',
    "round_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elimination_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elimination_games_predictions" (
    "id" SERIAL NOT NULL,
    "prediction_id" INTEGER,
    "game_id" INTEGER,
    "predicted_winner_id" INTEGER NOT NULL,
    "points_awarded" INTEGER,
    "round_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elimination_games_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elimination_matchups" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "team1_id" VARCHAR(2),
    "team2_id" VARCHAR(2)[],
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elimination_matchups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_games" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "group_id" INTEGER,
    "team1_id" INTEGER,
    "team2_id" INTEGER,
    "result" "result_enum",
    "status" "status_enum" DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_games_predictions" (
    "id" SERIAL NOT NULL,
    "prediction_id" INTEGER,
    "game_id" INTEGER,
    "predicted_result" "result_enum",
    "points_awarded" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_games_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_rankings" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "group_id" INTEGER,
    "team_id" INTEGER,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_rankings_predictions" (
    "id" SERIAL NOT NULL,
    "prediction_id" INTEGER,
    "group_id" INTEGER,
    "team_id" INTEGER,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_rankings_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "name" CHAR(1) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "user_id" INTEGER,
    "status" "status_enum" DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "teamguessed_points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "points_win" INTEGER NOT NULL,
    "points_draw" INTEGER NOT NULL,
    "points_loss" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_leaderboards" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER,
    "user_id" INTEGER,
    "total_points" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" SERIAL NOT NULL,
    "sport_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_group_members" (
    "id" SERIAL NOT NULL,
    "user_group_id" INTEGER,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "is_admin" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,
    "provider_account_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "all_time_leaderboard_user_id_key" ON "all_time_leaderboard"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "group_rankings_tournament_id_group_id_team_id_key" ON "group_rankings"("tournament_id", "group_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_rankings_predictions_prediction_id_group_id_team_id_key" ON "group_rankings_predictions"("prediction_id", "group_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_tournament_id_name_key" ON "groups"("tournament_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "predictions_tournament_id_user_id_key" ON "predictions"("tournament_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_name_key" ON "rounds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sports_name_key" ON "sports"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_country_id_key" ON "teams"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_leaderboards_tournament_id_user_id_key" ON "tournament_leaderboards"("tournament_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_group_members_user_group_id_user_id_key" ON "user_group_members"("user_group_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_account_id_key" ON "users"("provider_account_id");

-- AddForeignKey
ALTER TABLE "additional_group_rankings" ADD CONSTRAINT "additional_group_rankings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "additional_group_rankings" ADD CONSTRAINT "additional_group_rankings_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "all_time_leaderboard" ADD CONSTRAINT "all_time_leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games" ADD CONSTRAINT "elimination_games_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games" ADD CONSTRAINT "elimination_games_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games" ADD CONSTRAINT "elimination_games_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games" ADD CONSTRAINT "elimination_games_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games" ADD CONSTRAINT "elimination_games_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games_predictions" ADD CONSTRAINT "elimination_games_predictions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "elimination_games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games_predictions" ADD CONSTRAINT "elimination_games_predictions_predicted_winner_id_fkey" FOREIGN KEY ("predicted_winner_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games_predictions" ADD CONSTRAINT "elimination_games_predictions_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_games_predictions" ADD CONSTRAINT "elimination_games_predictions_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elimination_matchups" ADD CONSTRAINT "elimination_matchups_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_games" ADD CONSTRAINT "group_games_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_games" ADD CONSTRAINT "group_games_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_games" ADD CONSTRAINT "group_games_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_games" ADD CONSTRAINT "group_games_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_games_predictions" ADD CONSTRAINT "group_games_predictions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "group_games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_games_predictions" ADD CONSTRAINT "group_games_predictions_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_rankings" ADD CONSTRAINT "group_rankings_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_rankings" ADD CONSTRAINT "group_rankings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_rankings" ADD CONSTRAINT "group_rankings_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_rankings_predictions" ADD CONSTRAINT "group_rankings_predictions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_rankings_predictions" ADD CONSTRAINT "group_rankings_predictions_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_rankings_predictions" ADD CONSTRAINT "group_rankings_predictions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_leaderboards" ADD CONSTRAINT "tournament_leaderboards_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournament_leaderboards" ADD CONSTRAINT "tournament_leaderboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_group_members" ADD CONSTRAINT "user_group_members_user_group_id_fkey" FOREIGN KEY ("user_group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_group_members" ADD CONSTRAINT "user_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

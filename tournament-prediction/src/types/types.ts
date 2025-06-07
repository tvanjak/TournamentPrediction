import { ResultEnum, StatusEnum } from "./enums";

export type Team = {
    id: number;
    countries?: { name: string };
}

export type TournamentGroupGamesType = {
    groupName: string;
    groupId: number;
    games: {
        id: number;
        team1?: Team;
        team2?: Team;
        result?: ResultEnum;
        status: StatusEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

export type TournamentEliminationGamesType = {
    roundName: string;
    roundId: number;
    games: {
        id: number;
        rounds?: { name: string };
        team1?: Team;
        team2?: Team;
        winner_id?: number;
        status: StatusEnum;
    }[];
};

export type PredictionGroupGamesType = {
    groupId: number;
    groupName: string;
    games: {
        id: number;
        team1?: Team;
        team2?: Team;
        predicted_result?: ResultEnum;
        points_awarded: number;
        status: StatusEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

export type PredictionEliminationGamesType = {
    roundName: string;
    roundId: number;
    games: {
        id: number;
        actual_game_id: number;
        rounds?: { name: string };
        team1?: Team;
        team2?: Team;
        predicted_winner_id?: number;
        points_awarded?: number;
        status: StatusEnum;
    }[];
};

export type Matchup = {
    round_id: number;
    team1: string;
    team2: string;
    rounds: { id: number; name: string };
};

export type PointsSystemType = {
    points_win: number;
    points_draw: number;
    points_loss: number;
};
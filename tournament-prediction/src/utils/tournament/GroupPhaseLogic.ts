import { StatusEnum, ResultEnum } from "@/types/enums";
import { TournamentEliminationGamesType, TournamentGroupGamesType, Matchup, Team, PointsSystemType } from "@/types/types";

// Utility for deep cloning
const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));


export function handleRankingsChange(
  team: Team,
  setGroupGames: React.Dispatch<React.SetStateAction<TournamentGroupGamesType[]>>
) {
  setGroupGames((prevGroups) =>
    prevGroups.map((group) => {
      const changeIndex = group.rankings.findIndex(
        (r) => r.team.id === team.id
      );

      if (changeIndex > 0) {
        const newRankings = [...group.rankings];

        // Swap rank values
        const tempRank = newRankings[changeIndex - 1].rank;
        newRankings[changeIndex - 1] = {
          ...newRankings[changeIndex - 1],
          rank: newRankings[changeIndex].rank,
        };
        newRankings[changeIndex] = {
          ...newRankings[changeIndex],
          rank: tempRank,
        };

        // Sort the rankings again by updated rank
        newRankings.sort((a, b) => a.rank - b.rank);

        return {
          ...group,
          rankings: newRankings,
        };
      }

      return group;
    })
  );
}


export function handleUnlockGroupPhase(
  eliminationGames: TournamentEliminationGamesType[],
  setGroupGamesLock: (lock: boolean) => void,
  setEliminationGames: (games: TournamentEliminationGamesType[]) => void,
  setChampion: (champ: Team | null) => void
) {
  setGroupGamesLock(false);

  const newEliminationGames = deepCopy(eliminationGames);

  newEliminationGames.forEach((round) => {
    round.games.forEach((game) => {
      game.team1 = undefined;
      game.team2 = undefined;
      game.winner_id = undefined;
      game.status = StatusEnum.Pending;
    });
  });

  newEliminationGames.sort((a, b) => b.roundId - a.roundId);

  setEliminationGames(newEliminationGames);
  setChampion(null);
}


export async function handleLockGroupPhase(
  tournamentId: number,
  groupGames: TournamentGroupGamesType[],
  eliminationGames: TournamentEliminationGamesType[],
  setGroupGamesLock: (lock: boolean) => void,
  setEliminationGames: (games: TournamentEliminationGamesType[]) => void,
  setChampion: (champ: Team | null) => void
) {
    setGroupGamesLock(true);

    const constructEliminationPhase = async () => {
    try {
        const res = await fetch(`/api/tournaments/${tournamentId}/elimination-matchups`);
        if (!res.ok) {
        throw new Error("Failed to fetch elimination matchups!");
        }

        const data = await res.json();
        const matchups = data as Matchup[];

        const teamMap: Record<string, Team | undefined> = {};
        groupGames.forEach((group) => {
        const rankings = group.rankings;
        for (let i = 1; i <= rankings.length; i++) {
            teamMap[`${group.groupName}${i}`] = rankings.find((r) => r.rank === i)?.team;
        }
        });

        const newEliminationGames = deepCopy(eliminationGames);

        newEliminationGames.forEach((round) => {
        if (round.roundId === matchups[0].round_id) {
            let matchupCounter = 0;
            round.games.forEach((game) => {
            game.team1 = teamMap[matchups[matchupCounter].team1];
            game.team2 = teamMap[matchups[matchupCounter].team2];
            game.winner_id = undefined;
            game.status = StatusEnum.Pending;
            matchupCounter++;
            });
        } else {
            round.games.forEach((game) => {
            game.team1 = undefined;
            game.team2 = undefined;
            game.winner_id = undefined;
            game.status = StatusEnum.Pending;
            });
        }
        });

        newEliminationGames.sort((a, b) => b.roundId - a.roundId);
        setEliminationGames(newEliminationGames);
    } catch (error) {
        console.error("Failed to fetch matchups!", error);
    }
    };
    constructEliminationPhase()
    setChampion(null);
}


export function handleGroupResultChange(
  gameId: number,
  groupId: number,
  value: ResultEnum,
  setGroupGames: React.Dispatch<React.SetStateAction<TournamentGroupGamesType[]>>,
  pointsSystem: PointsSystemType
) {
  setGroupGames((prevGroups) =>
    prevGroups.map((group) => {
      if (group.groupId !== groupId) return group;

      // Update games
      const updatedGames = group.games.map((game) =>
        game.id === gameId ? { ...game, result: value } : game
      );

      // Calculate new points per team
      const pointsMap: Record<number, { team: Team; points: number }> = {};

      for (const game of updatedGames) {
        const { team1, team2, result } = game;


        // Initialize teams
        if (!pointsMap[team1!.id])
          pointsMap[team1!.id] = { team: team1!, points: 0 };
        if (!pointsMap[team2!.id])
          pointsMap[team2!.id] = { team: team2!, points: 0 };

        // Apply scoring rules
        if (result === ResultEnum.HomeWin) {
          pointsMap[team1!.id].points += pointsSystem.points_win;
        } else if (result === ResultEnum.AwayWin) {
          pointsMap[team2!.id].points += pointsSystem.points_win;
        } else if (result === ResultEnum.Draw) {
          pointsMap[team1!.id].points += pointsSystem.points_draw;
          pointsMap[team2!.id].points += pointsSystem.points_draw;
        }
      }

      // Convert to rankings array and sort
      const rankings = Object.values(pointsMap)
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({
          rank: index + 1,
          points: entry.points,
          team: entry.team,
        }));

      return {
        ...group,
        games: updatedGames,
        rankings,
      };
    })
  );
}


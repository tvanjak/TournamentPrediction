import { Team, PredictionEliminationGamesType } from "@/types/types";


export function handleEliminationResultChange(
  gameId: number,
  roundId: number,
  newWinner: Team | undefined,
  previousWinnerId: number | undefined,
  setEliminationGames: React.Dispatch<React.SetStateAction<PredictionEliminationGamesType[]>>,
  setChampion: React.Dispatch<React.SetStateAction<Team | null | undefined>>
) {
  if (newWinner?.id == previousWinnerId) return;

  setEliminationGames((prevRounds) => {
    let changedRoundIndex = -1;

    // Update the selected game and find which round it's in
    const updatedRounds = prevRounds.map((round) => {
      const hasTargetGame = round.games.some((game) => game.id === gameId);
      if (hasTargetGame) changedRoundIndex = round.roundId;

      return {
        ...round,
        games: round.games.map((game) => {
          const clonedGame = { ...game }; // shallow copy
          if (game.id === gameId) {
            clonedGame.predicted_winner_id = newWinner?.id;
          }
          return clonedGame;
        }),
      };
    });

    if (changedRoundIndex > 1) {
      let GameIndexInRound: number | undefined;

      for (let i = 0; i < updatedRounds.length; i++) {
        if (updatedRounds[i].roundId == changedRoundIndex) {
          for (let j = 0; j < updatedRounds[i].games.length; j++) {
            if (updatedRounds[i].games[j].id == gameId) {
              GameIndexInRound = j;
            }
          }
        }
      }

      const winnerIds_array = [previousWinnerId];
      for (let i = 0; i < updatedRounds.length; i++) {
        let updatedGame = false;
        if (updatedRounds[i].roundId < roundId && !updatedGame) {
          GameIndexInRound = Math.floor(GameIndexInRound! / 2);

          // GLEDAMO RUNDU NEPOSREDNO NAKON
          if (updatedRounds[i].roundId == roundId - 1) {
            if (
              updatedRounds[i].games[GameIndexInRound].team1?.id ==
                previousWinnerId &&
              previousWinnerId &&
              !updatedGame
            ) {
              updatedGame = true;
              updatedRounds[i].games[GameIndexInRound].team1 = newWinner;
              updatedRounds[i].games[GameIndexInRound].predicted_winner_id = undefined;
              if (
                updatedRounds[i].games[GameIndexInRound].team2?.id != undefined
              ) {
                winnerIds_array.push(
                  updatedRounds[i].games[GameIndexInRound].team2!.id
                );
              }
            } else if (
              updatedRounds[i].games[GameIndexInRound].team2?.id ==
                previousWinnerId &&
              previousWinnerId &&
              !updatedGame
            ) {
              updatedGame = true;
              updatedRounds[i].games[GameIndexInRound].team2 = newWinner;
              updatedRounds[i].games[GameIndexInRound].predicted_winner_id = undefined;
              if (
                updatedRounds[i].games[GameIndexInRound].team1?.id != undefined
              ) {
                winnerIds_array.push(
                  updatedRounds[i].games[GameIndexInRound].team1!.id
                );
              }
            } else if (!updatedGame) {
              if (
                updatedRounds[i].games[GameIndexInRound].team1 == undefined
              ) {
                updatedRounds[i].games[GameIndexInRound].team1 = newWinner;
                updatedGame = true;
              } else if (
                updatedRounds[i].games[GameIndexInRound].team2 == undefined
              ) {
                updatedRounds[i].games[GameIndexInRound].team2 = newWinner;
                updatedGame = true;
              }
            }
          }

          // GLEDAMO OSTALE RUNDE (PROPAGIRAMO PROMJENE)
          else {
            if (
              // NAIŠLI SMO NA UTAKMICU U KOJOJ TREBAMO PROPAGIRATI PROMJENE IZ RANIJE FAZE
              updatedRounds[i].games[GameIndexInRound].team1?.id &&
              winnerIds_array.includes(
                updatedRounds[i].games[GameIndexInRound].team1?.id
              ) &&
              !updatedGame
            ) {
              updatedGame = true;
              updatedRounds[i].games[GameIndexInRound].team1 = undefined;
              updatedRounds[i].games[GameIndexInRound].predicted_winner_id = undefined;
              if (
                updatedRounds[i].games[GameIndexInRound].team2?.id != undefined
              )
                winnerIds_array.push(
                  updatedRounds[i].games[GameIndexInRound].team2!.id
                );
            } else if (
              // NAIŠLI SMO NA UTAKMICU U KOJOJ TREBAMO PROPAGIRATI PROMJENE IZ RANIJE FAZE
              updatedRounds[i].games[GameIndexInRound].team2?.id &&
              winnerIds_array.includes(
                updatedRounds[i].games[GameIndexInRound].team2?.id
              ) &&
              !updatedGame
            ) {
              updatedGame = true;
              updatedRounds[i].games[GameIndexInRound].team2 = undefined;
              updatedRounds[i].games[GameIndexInRound].predicted_winner_id = undefined;
              if (
                updatedRounds[i].games[GameIndexInRound].team1?.id != undefined
              )
                winnerIds_array.push(
                  updatedRounds[i].games[GameIndexInRound].team1!.id
                );
            }
          }
        }
      }
    }

    for (let i = 0; i < updatedRounds.length; i++) {
      if (updatedRounds[i].roundId == 1) {
        if (!updatedRounds[i].games[0].predicted_winner_id) {
          setChampion(null);
        }
      }
    }
    if (roundId == 1) {
      setChampion(newWinner ?? null);
    }

    return updatedRounds;
  });
}

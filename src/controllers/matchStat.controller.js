const Tournament = require("../models/tournament");
const tournamentController = require("../controllers/TournamentController");
const Team = require("../models/team");
const Match = require("../models/matches");
const MatchStats = require("../models/matchStats");
const Player = require("../models/players");

const getMatchStatsByMatchId = async (matchId, teamId1, teamId2) => {
  try {
    const match = await Match.findById(matchId);
    const team1 = match.team1;
    const team2 = match.team2;
    // Find the match stats for both teams by match ID
    const matchStatsTeam1 = await MatchStats.findOne({
      match: matchId,
      team: teamId1,
    }).populate("yellowCards");
    const matchStatsTeam2 = await MatchStats.findOne({
      match: matchId,
      team: teamId2,
    }).populate("scorers yellowCards");

    if (!matchStatsTeam1 || !matchStatsTeam2) {
      throw { status: 404, message: "Match stats not found" };
    }

    return { matchStatsTeam1, matchStatsTeam2 };
  } catch (error) {
    console.error("Error getting match stats by match ID:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    };
  }
};

const getMatchStatsByMatchIdPost = async (matchId) => {
  try {
    const matchStatsTeam1 = await MatchStats.findOne({ match: matchId });
    const matchStatsTeam2 = await MatchStats.findOne({ match: matchId, team: { $ne: matchStatsTeam1.team } });

    if (!matchStatsTeam1 || !matchStatsTeam2) {
      throw { status: 404, message: "Match stats not found" };
    }

    // Fetch team names
    const team1 = await Team.findById(matchStatsTeam1.team);
    const team2 = await Team.findById(matchStatsTeam2.team);

// Fetch player names for team1
const scorersTeam1 = await Promise.all(matchStatsTeam1.scorers.map(async (playerId) => {
  const player = await Player.findById(playerId);
  console.log(player)
  if (player) {
    return `${player.firstName} ${player.lastName}`;
  }
  return null;
}));

// Fetch player names for team2
const scorersTeam2 = await Promise.all(matchStatsTeam2.scorers.map(async (playerId) => {
  const player = await Player.findById(playerId);
  console.log(player)

  if (player) {
    return `${player.firstName} ${player.lastName}`;
  }
  return playerId; // Or handle as per your requirements
}));


// Fetch player names for team1
const redCardsTeam1 = await Promise.all(matchStatsTeam1.redCards.map(async (playerId) => {
  const player = await Player.findById(playerId);
  if (player) {
    return `${player.firstName} ${player.lastName}`;
  }
  return null; // Or handle as per your requirements
}));

// Fetch player names for team2
const yellowCardsTeam2 = await Promise.all(matchStatsTeam2.yellowCards.map(async (playerId) => {
  const player = await Player.findById(playerId);
  if (player) {
    return `${player.firstName} ${player.lastName}`;
  }
  return null; // Or handle as per your requirements
}));

// Fetch player names for team2
const assistersTeam2 = await Promise.all(matchStatsTeam2.assisters.map(async (playerId) => {
  const player = await Player.findById(playerId);
  if (player) {
    return `${player.firstName} ${player.lastName}`;
  }
  return null; // Or handle as per your requirements
}));

// Replace IDs with names
const matchStatsTeam1WithNames = {
  ...matchStatsTeam1.toObject(),
  team: team1.name,
  scorers: scorersTeam1,
  redCards: redCardsTeam1,
};
const matchStatsTeam2WithNames = {
  ...matchStatsTeam2.toObject(),
  team: team2.name,
  scorers: scorersTeam2,
  yellowCards: yellowCardsTeam2,
  assisters: assistersTeam2,
};


    console.log("team1", matchStatsTeam1WithNames);
    console.log("team2", matchStatsTeam2WithNames);

    return { matchStatsTeam1: matchStatsTeam1WithNames, matchStatsTeam2: matchStatsTeam2WithNames };
  } catch (error) {
    console.error("Error getting match stats by match ID:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    };
  }
};

const scoreGoal = async (idmatch, idplayer1, idteam) => {
  try {
    // Find the match using matchId and populate team stats
    const matchStats = await MatchStats.findById(idmatch)
      .populate({
        path: "redCards yellowCards assisters scorers lineup",
        populate: { path: "player", model: "Player" },
      })
      .exec();
    console.log(matchStats);
    if (!matchStats) {
      throw new Error("Match stats not found");
    }

    let scoringTeamStats;

    // Check if idteam matches either team1 or team2
    if (idteam && matchStats.team._id.toString() === idteam) {
      scoringTeamStats = matchStats;
    } else {
      throw new Error("Invalid team ID provided");
    }

    console.log("scoringTeamStats:", scoringTeamStats);

    // Ensure scoringTeamStats is an object before accessing 'score'
    if (scoringTeamStats && typeof scoringTeamStats === "object") {
      // Update scoring team's score
      scoringTeamStats.score = (scoringTeamStats.score || 0) + 1;

      // Update individual player's goals scored
      const scorerPlayerId = idplayer1; // Replace with the actual scorer player ID

      // Check if the player is already in the scorers array
      const existingScorer = scoringTeamStats.scorers.find(
        (scorer) => scorer.player._id.toString() === scorerPlayerId
      );

      if (existingScorer) {
        // Player is already in the scorers array, update their goalsScored
        existingScorer.goalsScored = (existingScorer.goalsScored || 0) + 1;

        // Save the updated goalsScored to the Player model
        await Player.findByIdAndUpdate(
          scorerPlayerId,
          { $inc: { goalsScored: 1 } },
          { new: true }
        );
      } else {
        const player = await Player.findById(scorerPlayerId);
        if (!player) {
          throw new Error("Player not found");
        }
        // Player is not in the scorers array, add them
        scoringTeamStats.scorers.push({ player: player._id, goalsScored: 1 });

        // Save the updated goalsScored to the Player model
      }

      console.log("Updated scoringTeamStats:", scoringTeamStats);
      const lastScoredPlayer = await Player.findById(scorerPlayerId);

      await scoringTeamStats.save();

      return {
        scoringTeamStats,
        lastScoredPlayerName: lastScoredPlayer.firstName,
      };
    } else {
      throw new Error("Invalid scoringTeamStats");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

const assistOnly = async (idmatch, idplayer, idteam) => {
  try {
    // Find the match using matchId and populate team stats
    const matchStats = await MatchStats.findById(idmatch)
      .populate({
        path: "redCards yellowCards assisters scorers lineup",
        populate: { path: "player", model: "Player" },
      })
      .exec();

    if (!matchStats) {
      throw new Error("Match stats not found");
    }

    let assistingTeamStats;

    // Check if idteam matches either team1 or team2
    if (idteam && matchStats.team._id.toString() === idteam) {
      assistingTeamStats = matchStats;
    } else {
      throw new Error("Invalid team ID provided");
    }

    console.log("assistingTeamStats:", assistingTeamStats);

    // Ensure assistingTeamStats is an object before accessing 'assist'
    if (assistingTeamStats && typeof assistingTeamStats === "object") {
      // Check if idplayer exists
      if (idplayer) {
        // Update individual player's assist
        const assisterPlayerId = idplayer; // Replace with the actual assister player ID

        // Check if the player is already in the assisters array
        const existingAssister = assistingTeamStats.assisters.find(
          (assister) => assister.player._id.toString() === assisterPlayerId
        );

        if (existingAssister) {
          // Player is already in the assisters array, update their assist
          existingAssister.assists = (existingAssister.assists || 0) + 1;

          // Save the updated assist to the Player model
          await Player.findByIdAndUpdate(
            assisterPlayerId,
            { $inc: { assists: 1 } },
            { new: true }
          );
        } else {
          // Player is not in the assisters array, add them
          assistingTeamStats.assisters.push({
            player: assisterPlayerId,
            assists: 1,
          });
        }

        console.log("Updated assistingTeamStats:", assistingTeamStats);

        // Save the updated matchStats document for the assisting team
        await assistingTeamStats.save();

        return assistingTeamStats;
      } else {
        throw new Error("No player ID provided");
      }
    } else {
      throw new Error("Invalid assistingTeamStats");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

const getMatch = async (matchId) => {
  try {
    // Find the match stats directly based on matchId and teamId
    const matchStats = await MatchStats.find({ match: matchId })
      .populate({
        path: "redCards yellowCards assisters scorers lineup",
        populate: { path: "player", model: "Player" },
      })
      .exec();

    if (!matchStats) {
      throw new Error("Match stats not found");
    }

    return matchStats;
  } catch (error) {
    console.error("Error getting match stats:", error);
    throw error;
  }
};

const getMatchStats = async (matchId, teamId) => {
  console.log(teamId);
  try {
    const matchStats = await MatchStats.findOne({
      match: matchId,
      team: teamId,
    })
      .populate({
        path: "redCards yellowCards assisters scorers lineup",
        populate: { path: "player", model: "Player" },
      })
      .exec();

    if (!matchStats) {
      throw new Error("Match stats not found");
    }

    return matchStats;
  } catch (error) {
    console.error("Error getting match stats:", error);
    throw error;
  }
};
const updateTeamWin = async (match) => {
  try {
    console.log(match);
    // Récupérer les statistiques du match pour chaque équipe
    const matchStatsTeam1 = await getMatchStats(match._id, match.team1._id);
    const matchStatsTeam2 = await getMatchStats(match._id, match.team2._id);

    // Vérifier le score de chaque équipe
    const scoreTeam1 = matchStatsTeam1.score;
    const scoreTeam2 = matchStatsTeam2.score;
    let winner;

    // Mettre à jour l'attribut 'win' du modèle 'Team' en fonction du score
    if (scoreTeam1 > scoreTeam2) {
      await Team.updateOne({ _id: match.team1._id }, { $inc: { win: 1 } });
      await Team.updateOne({ _id: match.team2._id }, { $inc: { lose: 1 } });
      await Match.updateOne({ _id: match._id }, { isWinner: match.team1._id });
      winner = match.team1._id;
    } else if (scoreTeam2 > scoreTeam1) {
      await Team.updateOne({ _id: match.team2._id }, { $inc: { win: 1 } });
      await Team.updateOne({ _id: match.team1._id }, { $inc: { lose: 1 } });
      await Match.updateOne({ _id: match._id }, { isWinner: match.team2._id });
      winner = match.team2._id;
    } else if (scoreTeam2 == scoreTeam1) {
      await Team.updateOne({ _id: match.team2._id }, { $inc: { nul: 1 } });
      await Team.updateOne({ _id: match.team1._id }, { $inc: { nul: 1 } });
    }
    await Match.updateOne({ _id: match._id }, { status: "FINISHED" });
    console.log(match.stage);
    switch (match.stage) {
      case "LEAGUE":
      case "GROUP_STAGE":
        const tournament = await Tournament.findById(match.tournament._id);

        const team1Standings = tournament.standings.find(
          (standing) => String(standing.team) === String(match.team1)
        );
        const team2Standings = tournament.standings.find(
          (standing) => String(standing.team) === String(match.team2)
        );

        if (!team1Standings || !team2Standings) {
          throw new Error("Standings not found for one or both teams");
        }
        team1Standings.gamesPlayed += 1;
        team2Standings.gamesPlayed += 1;

        if (match.isWinner === match.team1) {
          team1Standings.points += tournament.rules.pointsPerWin;
          team1Standings.wins += 1;
          team1Standings.goalsFor += scoreTeam1;
          team1Standings.goalsAgainst += scoreTeam2;
          team1Standings.goalDifference =
            team1Standings.goalsFor - team1Standings.goalsAgainst;

          team2Standings.losses += 1;
          team2Standings.goalsFor += scoreTeam2;
          team2Standings.goalsAgainst += scoreTeam1;
          team2Standings.goalDifference =
            team2Standings.goalsFor - team2Standings.goalsAgainst;
        } else if (match.isWinner === "DRAW") {
          team1Standings.points += tournament.rules.pointsPerDraw;
          team1Standings.draws += 1;
          team1Standings.goalsFor += scoreTeam1;
          team1Standings.goalsAgainst += scoreTeam2;
          team1Standings.goalDifference =
            team1Standings.goalsFor - team1Standings.goal;

          team2Standings.points += tournament.rules.pointsPerDraw;
          team2Standings.draws += 1;
          team2Standings.goalsFor += scoreTeam2;
          team2Standings.goalsAgainst += scoreTeam1;
          team2Standings.goalDifference =
            team2Standings.goalsFor - team2Standings.goal;
        } else {
          team2Standings.points += tournament.rules.pointsPerWin;
          team2Standings.wins += 1;
          team2Standings.goalsFor += scoreTeam2;
          team2Standings.goalsAgainst += scoreTeam1;
          team2Standings.goalDifference =
            team2Standings.goalsFor - team2Standings.goal;

          team1Standings.losses += 1;
          team1Standings.goalsFor += scoreTeam1;
          team1Standings.goalsAgainst += scoreTeam2;
          team1Standings.goalDifference =
            team1Standings.goalsFor - team1Standings.goalsAgainst;
        }

        await tournament.save();
        console.log("first");
        break;
      case "KNOCKOUT":
      case "KNOCKOUT_STAGE":
        const nextM = await Match.findById(match.nextMatch);
        console.log(nextM);
        if (nextM) {
          if (!nextM.team1) {
            await Match.findByIdAndUpdate(nextM._id, { team1: winner });
          } else {
            await Match.findByIdAndUpdate(nextM._id, { team2: winner });
          }
        } else {
          await Tournament.updateOne(
            { _id: match.tournament._id },
            { tournamentWinner: match.isWinner }
          );
        }
        break;
    }

    console.log("Team win updated successfully");
  } catch (error) {
    console.error("Error updating team win:", error);
    throw error;
  }
};
const startMatch = async (matchId) => {
  try {
    // Update match status
    await Match.updateOne({ _id: matchId }, { status: "LIVE" });

    console.log("Match status updated successfully");
  } catch (error) {
    console.error(
      "Error updating match status or creating match stats:",
      error
    );
    throw error;
  }
};
const cancelGoal = async (idmatch, idplayer1, idplayer2, idteam) => {
  try {
    // Find the match using matchId and populate team stats
    const matchStats = await MatchStats.findById(idmatch)
      .populate({
        path: "redCards yellowCards assisters scorers lineup",
        populate: { path: "player", model: "Players" },
      })
      .exec();

    if (!matchStats) {
      throw new Error("Match stats not found");
    }

    let scoringTeamStats;

    // Check if idteam matches either team1 or team2
    if (idteam && matchStats.team._id.toString() === idteam) {
      scoringTeamStats = matchStats;
    } else {
      throw new Error("Invalid team ID provided");
    }

    console.log("scoringTeamStats:", scoringTeamStats);

    // Ensure scoringTeamStats is an object before accessing 'score'
    if (scoringTeamStats && typeof scoringTeamStats === "object") {
      // Update scoring team's score
      scoringTeamStats.score = (scoringTeamStats.score || 0) - 1;

      // Update individual player's goals scored
      const scorerPlayerId = idplayer1; // Replace with the actual scorer player ID

      // Check if the player is already in the scorers array
      const existingScorer = scoringTeamStats.scorers.find(
        (scorer) => scorer.player._id.toString() === scorerPlayerId
      );

      if (existingScorer) {
        // Player is already in the scorers array, update their goalsScored
        existingScorer.goalsScored = (existingScorer.goalsScored || 0) - 1;

        // Save the updated goalsScored to the Player model
        const scorerPlayer = await Player.findByIdAndUpdate(
          scorerPlayerId,
          { $inc: { goalsScored: 1 } },
          { new: true }
        );
      } else {
        // Player is not in the scorers array, add them
        scoringTeamStats.scorers.push({
          player: scorerPlayerId,
          goalsScored: 1,
        });

        // Save the updated goalsScored to the Player model
        const scorerPlayer = await Player.findByIdAndUpdate(
          scorerPlayerId,
          { $inc: { goalsScored: -1 } },
          { new: true }
        );
      }

      // Check if idplayer2 exists
      if (idplayer2) {
        // Update individual player's assist
        const assisterPlayerId = idplayer2; // Replace with the actual assister player ID

        // Check if the player is already in the assisters array
        const existingAssister = scoringTeamStats.assisters.find(
          (assister) => assister.player._id.toString() === assisterPlayerId
        );

        if (existingAssister) {
          // Player is already in the assisters array, update their assist
          existingAssister.assist = (existingAssister.assist || 0) - 1;

          // Save the updated assist to the Player model
          const assisterPlayer = await Player.findByIdAndUpdate(
            assisterPlayerId,
            { $inc: { assist: -1 } },
            { new: true }
          );
        } else {
          // Player is not in the assisters array, add them
          scoringTeamStats.assisters.push({
            player: assisterPlayerId,
            assist: 1,
          });

          // Save the updated assists to the Player model
          const assisterPlayer = await Player.findByIdAndUpdate(
            assisterPlayerId,
            { $inc: { assist: -1 } },
            { new: true }
          );
        }
      }

      console.log("Updated scoringTeamStats:", scoringTeamStats);

      // Save the updated matchStats document for the scoring team
      await scoringTeamStats.save();

      return { message: "Goal scored successfully" };
    } else {
      throw new Error("Invalid scoringTeamStats");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

const addYellowCard = async (idmatch, idplayer, idteam) => {
  try {
    // Find the match using matchId and populate team stats
    const matchStats = await MatchStats.findById(idmatch)
      .populate({
        path: "redCards yellowCards assisters scorers lineup",
        populate: { path: "player", model: "Player" },
      })
      .exec();

    if (!matchStats) {
      throw new Error("Match stats not found");
    }

    let teamStats;

    // Check if idteam matches either team1 or team2
    if (idteam && matchStats.team._id.toString() === idteam) {
      teamStats = matchStats;
    } else {
      throw new Error("Invalid team ID provided");
    }

    // Update individual player's yellow cards
    const playerId = idplayer; // Replace with the actual player ID

    // Check if the player is already in the yellowCards array
    const existingPlayer = teamStats.yellowCards.find(
      (card) => card.player._id.toString() === playerId
    );

    if (existingPlayer) {
      // Player is already in the yellowCards array, update their yellowCards count
      if (existingPlayer.cards === 2) {
        addRedCard(idmatch, idplayer, idteam);
        return;
      }
      existingPlayer.cards += 1;
    } else {
      // Player is not in the yellowCards array, add them
      const player = await Player.findById(playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      teamStats.yellowCards.push({
        player: playerId,
        cards: 1,
      });
    }

    // Save the updated yellowCards to the Player model
    await Player.findByIdAndUpdate(
      playerId,
      { $inc: { yellowCards: 1 } },
      { new: true }
    );

    // Save the updated matchStats document
    await teamStats.save();

    console.log(teamStats);
    const player = await Player.findById(playerId);

    console.log(player.firstName);
    x = player.firstName;
    return player.firstName;
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

const addRedCard = async (idmatch, idplayer, idteam) => {
  try {
    // Find the match using matchId and populate team stats
    const matchStats = await MatchStats.findById(idmatch)
      .populate({
        path: "redCards yellowCards assisters scorers lineup",
        populate: { path: "player", model: "Player" },
      })
      .exec();

    console.log(matchStats);

    if (!matchStats) {
      throw new Error("Match stats not found");
    }

    let teamStats;

    // Check if idteam matches either team1 or team2
    if (idteam && matchStats.team._id.toString() === idteam) {
      teamStats = matchStats;
    } else {
      throw new Error("Invalid team ID provided");
    }

    // Update individual player's yellow cards
    const playerId = idplayer; // Replace with the actual player ID

    // Check if the player is already in the redCards array
    const existingPlayer = teamStats.redCards.find(
      (card) => card.player._id.toString() === playerId
    );

    if (existingPlayer) {
      // Player is already in the redCards array, update their redCards count
      existingPlayer.redCards += 1;
    } else {
      // Player is not in the redCards array, add them
      teamStats.redCards.push({ player: playerId, redCards: 1 });
    }

    // Save the updated redCards to the Player model
    await Player.findByIdAndUpdate(
      playerId,
      { $inc: { redCards: 1 } },
      { new: true }
    );

    // Save the updated matchStats document
    await teamStats.save();

    const player = await Player.findById(playerId);

    console.log(player.firstName);
    return player.firstName;
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

module.exports = {
  scoreGoal,
  getMatchStats,
  cancelGoal,
  addYellowCard,
  addRedCard,
  updateTeamWin,
  assistOnly,
  startMatch,
  getMatch,
  getMatchStatsByMatchId,
  getMatchStatsByMatchIdPost
};

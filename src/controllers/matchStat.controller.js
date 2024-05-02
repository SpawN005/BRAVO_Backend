const Tournament = require("../models/tournament");

const Team = require("../models/team");
const Match = require("../models/matches");
const MatchStats = require("../models/matchStats");
const Player = require("../models/players");

const Team = require('../models/team');
const Match = require('../models/matches');
const MatchStats = require('../models/matchStats');
const Player = require('../models/players');



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
        scoringTeamStats.scorers.push({
          firstName: player.firstName,
          player: scorerPlayerId,
          goalsScored: 1,
        });
        // Save the updated goalsScored to the Player model
        await Player.findByIdAndUpdate(
          scorerPlayerId,
          { $inc: { goalsScored: 1 } },
          { new: true }
        );
      }

      console.log("Updated scoringTeamStats:", scoringTeamStats);

      // Save the updated matchStats document for the scoring team
      await scoringTeamStats.save();

      return scoringTeamStats;
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
          existingAssister.assist = (existingAssister.assist || 0) + 1;

          // Save the updated assist to the Player model
          await Player.findByIdAndUpdate(
            assisterPlayerId,
            { $inc: { assist: 1 } },
            { new: true }
          );
        } else {
          // Player is not in the assisters array, add them
          assistingTeamStats.assisters.push({
            player: assisterPlayerId,
            assist: 1,
          });

          // Save the updated assists to the Player model
          await Player.findByIdAndUpdate(
            assisterPlayerId,
            { $inc: { assist: 1 } },
            { new: true }
          );
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
    // Find the match stats directly based on matchId and teamId
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
    console.log(matchStatsTeam1);
    console.log(matchStatsTeam2);
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
    switch (match.stage) {
      case "LEAGUE":
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
        team1Standings.gamesPlayed+=1;
        team2Standings.gamesPlayed+=1;

        if (match.isWinner === match.team1) {
          team1Standings.points += 3;
          team1Standings.wins += 1;
          team1Standings.goalsFor += scoreTeam1;
          team1Standings.goalsAgainst += scoreTeam2;
          team1Standings.goalDifference = Math.abs(
            team1Standings.goalsFor - team1Standings.goalsAgainst
          );

          team2Standings.losses += 1;
          team2Standings.goalsFor += scoreTeam2;
          team2Standings.goalsAgainst += scoreTeam1;
          team2Standings.goalDifference = Math.abs(
            team2Standings.goalsFor - team2Standings.goalsAgainst
          );
        } else if (match.isWinner === "DRAW") {
          team1Standings.points += 1;
          team1Standings.draws += 1;
          team1Standings.goalsFor += scoreTeam1;
          team1Standings.goalsAgainst += scoreTeam2;
          team1Standings.goalDifference = Math.abs(
            team1Standings.goalsFor - team1Standings.goalsAgainst
          );

          team2Standings.points += 1;
          team2Standings.draws += 1;
          team2Standings.goalsFor += scoreTeam2;
          team2Standings.goalsAgainst += scoreTeam1;
          team2Standings.goalDifference = Math.abs(
            team2Standings.goalsFor - team2Standings.goalsAgainst
          );
        } else {
          team2Standings.points += 3;
          team2Standings.wins += 1;
          team2Standings.goalsFor += scoreTeam2;
          team2Standings.goalsAgainst += scoreTeam1;
          team2Standings.goalDifference = Math.abs(
            team2Standings.goalsFor - team2Standings.goalsAgainst
          );

          team1Standings.losses += 1;
          team1Standings.goalsFor += scoreTeam1;
          team1Standings.goalsAgainst += scoreTeam2;
          team1Standings.goalDifference = Math.abs(
            team1Standings.goalsFor - team1Standings.goalsAgainst
          );
        }

        await tournament.save();
          console.log("first")
        break;
      case "KNOCKOUT":
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
// const startMatch = async (matchId) => {
//   try {
//       await Match.updateOne({ _id: matchId }, { status: true });

//       console.log('Match status updated successfully');
//   } catch (error) {
//       console.error('Error updating match status:', error);
//       throw error;
//   }
// };
const startMatch = async (matchId) => {
  try {
    // Update match status
    await Match.updateOne({ _id: matchId }, { status: true });

    // Fetch the match details to get team information
    const match = await Match.findById(matchId);
    const team1 = match.team1;
    const team2 = match.team2;

    // Create MatchStats documents for each team
    const matchStatsTeam1 = await MatchStats.create({
      match:match,
      team: team1,
      redCards: [],
      yellowCards: [],
      assisters: [],
      scorers: [],
      score: null,
    });

    const matchStatsTeam2 = await MatchStats.create({
      match: match,
      team: team2,
      redCards: [],
      yellowCards: [],
      assisters: [],
      scorers: [],
      score: null,
    });

    console.log('Match status updated successfully');
    console.log('Match stats created successfully for teams:', team1, 'and', team2);
  } catch (error) {
    console.error('Error updating match status or creating match stats:', error);
    throw error;
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
      existingPlayer.yellowCards += 1;
    } else {
      // Player is not in the yellowCards array, add them
      const player = await Player.findById(playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      teamStats.yellowCards.push({
        player: playerId,
        firstName: player.firstName,
        yellowCards: 1,
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
};

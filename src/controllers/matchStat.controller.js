
const Tournament = require('../models/tournament');

const Team = require('../models/team');
const Match = require('../models/matches');
const MatchStats = require('../models/matchStats');
const Player = require('../models/players');




  const scoreGoal = async (idmatch, idplayer1, idplayer2, idteam) => {
    try {
      // Find the match using matchId and populate team stats
      const matchStats = await MatchStats.findById(idmatch)
        .populate({
          path: 'redCards yellowCards assisters scorers lineup',
          populate: { path: 'player', model: 'Players' },
        })
        .exec();
  
      if (!matchStats) {
        throw new Error('Match stats not found');
      }
  
      let scoringTeamStats;
  
      // Check if idteam matches either team1 or team2
      if (idteam && matchStats.team._id.toString() === idteam) {
        scoringTeamStats = matchStats;
      } else {
        throw new Error('Invalid team ID provided');
      }
  
      console.log('scoringTeamStats:', scoringTeamStats);
  
      // Ensure scoringTeamStats is an object before accessing 'score'
      if (scoringTeamStats && typeof scoringTeamStats === 'object') {
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
            { $inc: { goalsScored: 1 } },
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
            existingAssister.assist = (existingAssister.assist || 0) + 1;
  
            // Save the updated assist to the Player model
            const assisterPlayer = await Player.findByIdAndUpdate(
              assisterPlayerId,
              { $inc: { assist: 1 } },
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
              { $inc: { assist: 1 } },
              { new: true }
            );
          }
        }
  
        console.log('Updated scoringTeamStats:', scoringTeamStats);
  
        // Save the updated matchStats document for the scoring team
        await scoringTeamStats.save();
  
        return { message: 'Goal scored successfully' };
      } else {
        throw new Error('Invalid scoringTeamStats');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error');
    }
  };
  
  
  
  
  

  const getMatchStats = async (matchId, teamId) => {
    try {
      // Find the match stats directly based on matchId and teamId
      const matchStats = await MatchStats.findOne({ match: matchId, team: teamId })
        .populate({
          path: 'redCards yellowCards assisters scorers lineup',
          populate: { path: 'player', model: 'Players' },
        })
        .exec();
  
      if (!matchStats) {
        throw new Error('Match stats not found');
      }
  
      return matchStats;
    } catch (error) {
      console.error('Error getting match stats:', error);
      throw error;
    }
  };
  
  const cancelGoal = async (idmatch, idplayer1, idplayer2, idteam) => {
    try {
      // Find the match using matchId and populate team stats
      const matchStats = await MatchStats.findById(idmatch)
        .populate({
          path: 'redCards yellowCards assisters scorers lineup',
          populate: { path: 'player', model: 'Players' },
        })
        .exec();
  
      if (!matchStats) {
        throw new Error('Match stats not found');
      }
  
      let scoringTeamStats;
  
      // Check if idteam matches either team1 or team2
      if (idteam && matchStats.team._id.toString() === idteam) {
        scoringTeamStats = matchStats;
      } else {
        throw new Error('Invalid team ID provided');
      }
  
      console.log('scoringTeamStats:', scoringTeamStats);
  
      // Ensure scoringTeamStats is an object before accessing 'score'
      if (scoringTeamStats && typeof scoringTeamStats === 'object') {
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
            existingAssister.assist = (existingAssister.assist || 0) - 1 ;
  
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
  
        console.log('Updated scoringTeamStats:', scoringTeamStats);
  
        // Save the updated matchStats document for the scoring team
        await scoringTeamStats.save();
  
        return { message: 'Goal scored successfully' };
      } else {
        throw new Error('Invalid scoringTeamStats');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error');
    }
  };

  const addYellowCard = async (idmatch, idplayer, idteam) => {
    try {
      // Find the match using matchId and populate team stats
      const matchStats = await MatchStats.findById(idmatch)
        .populate({
          path: 'redCards yellowCards assisters scorers lineup',
          populate: { path: 'player', model: 'Players' },
        })
        .exec();
  
      console.log(matchStats);
  
      if (!matchStats) {
        throw new Error('Match stats not found');
      }
  
      let teamStats;
  
      // Check if idteam matches either team1 or team2
      if (idteam && matchStats.team._id.toString() === idteam) {
        teamStats = matchStats;
      } else {
        throw new Error('Invalid team ID provided');
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
        teamStats.yellowCards.push({ player: playerId, yellowCards: 1 });
      }
  
      // Save the updated yellowCards to the Player model
      await Player.findByIdAndUpdate(
        playerId,
        { $inc: { yellowCards: 1 } },
        { new: true }
      );
  
      // Save the updated matchStats document
      await teamStats.save();
  
      return { message: 'Yellow card added successfully' };
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error');
    }
  };

  const addRedCard = async (idmatch, idplayer, idteam) => {
    try {
      // Find the match using matchId and populate team stats
      const matchStats = await MatchStats.findById(idmatch)
        .populate({
          path: 'redCards yellowCards assisters scorers lineup',
          populate: { path: 'player', model: 'Players' },
        })
        .exec();
  
      console.log(matchStats);
  
      if (!matchStats) {
        throw new Error('Match stats not found');
      }
  
      let teamStats;
  
      // Check if idteam matches either team1 or team2
      if (idteam && matchStats.team._id.toString() === idteam) {
        teamStats = matchStats;
      } else {
        throw new Error('Invalid team ID provided');
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
  
      return { message: 'Yellow card added successfully' };
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error');
    }
  };
  const lineupMaking = async (matchId, idTeam, players) => {
    try {
      console.log(matchId, idTeam,players )
      // Find the match using matchId and populate team stats
      const matchStats = await MatchStats.findOne({ match: matchId, team: idTeam })
        .populate({
          path: 'redCards yellowCards assisters scorers lineup',
          populate: { path: 'player', model: 'Players' },
        })
        .exec(); 
        console.log(matchStats);


      if (!matchStats) {
        throw new Error('Match stats not found');
      }
    
      // Update the lineup in the match stats
      matchStats.lineup = players.map(playerId => ({ player: playerId }));
  
      // Save the updated matchStats document
      await matchStats.save();
  
      return { message: 'Lineup updated successfully' };
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error');
    }
  };
  
  const getFormattedLineup = async (matchId, teamId) => {
    try {
      const matchStats = await MatchStats.findOne({ match: matchId, team: teamId });
  
      if (!matchStats) {
        throw new Error('Match stats not found');
      }
  
      // Populate player details for each ID in the lineup
      const populatedLineup = await Promise.all(
        matchStats.lineup.map(async (playerId) => {
          const player = await Player.findById(playerId);
          if (player) {
            return {
              _id: player._id,
              firstName: player.firstName,
              lastName: player.lastName,
              // Include other fields from the playerSchema as required
            };
          } else {
            // Handle the case where the player is not found
            return { message: `Player with ID ${playerId} not found` };
          }
        })
      );
  
      return populatedLineup.filter(player => player != null);
    } catch (error) {
      console.error('Error fetching lineup:', error);
      throw new Error('Internal Server Error');
    }
  };

  module.exports = {
    scoreGoal,
    getMatchStats,
    cancelGoal,
    addYellowCard,
    addRedCard,
    lineupMaking,
    getFormattedLineup,
  };
  
  
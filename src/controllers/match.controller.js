const Tournament = require('../models/tournament');

 const Team = require('../models/team');
 const Match = require('../models/matches');
 const MatchStats = require('../models/matchStats');
 const Player = require('../models/players');
 



 const getMatchById = async (matchId) => {
  try {
    // Find the match by ID
    const match = await Match.findById(matchId);

    if (!match) {
      throw { status: 404, message: 'Match not found' };
    }

    return match;
  } catch (error) {
    console.error('Error getting match by ID:', error);
    throw { status: error.status || 500, message: error.message || 'Internal Server Error' };
  }
};
const updateMatchDateById = async (matchId, newDate) => {
  try {
    // Find the match by ID and update its date
    const updatedMatch = await Match.findByIdAndUpdate(matchId, { date: newDate }, { new: true });

    if (!updatedMatch) {
      throw { status: 404, message: 'Match not found' };
    }

    return updatedMatch;
  } catch (error) {
    console.error('Error updating match date by ID:', error);
    throw { status: error.status || 500, message: error.message || 'Internal Server Error' };
  }
};


const getTournamentById = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      throw { status: 404, message: 'Tournament not found' };
    }
    console.log(tournament);
    return tournament;
  } catch (error) {
    console.error('Error getting tournament by ID:', error.message);
    throw { status: 500, message: 'Internal Server Error' };
  }
};



const getTeamsInTournament = async (tournamentId) => {
  try {
    const tournament = await getTournamentById(tournamentId);

    const teams = [];

    // Extract teams from groups
    tournament.groups.forEach((group) => {
      group.teams.forEach((team) => {
        teams.push(team.name);
      });
    });

    return teams;
  } catch (error) {
    console.error('Error getting teams in tournament:', error.message);
    throw { status: 500, message: 'Internal Server Error' };
  }
};

const getAllTeamsInTournament = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      throw { status: 404, message: 'Tournament not found' };
    }

    console.log('Tournament:', tournament); // Log the entire tournament object

    const teams = [];

    // Check the type of the tournament
    switch (tournament.rules?.type) {
      case 'LEAGUE':
      case 'GROUP_KNOCKOUT':
        // Iterate through groups and teams
        tournament.groups.forEach((group) => {
          group.teams.forEach((team) => {
            teams.push({ teamId: team, groupName: group.name });
          });
        });
        break;

      case 'KNOCKOUT':
        // For knockout, teams are directly in the main group
        tournament.groups[0]?.teams.forEach((team) => {
          teams.push({ teamId: team, groupName: tournament.groups[0]?.name });
        });
        break;

      default:
        throw { status: 500, message: 'Unsupported tournament type' };
    }

    return teams;
  } catch (error) {
    console.error('Error getting teams in tournament:', error.message);
    throw { status: 500, message: 'Internal Server Error' };
  }
};
const createMatch = async ({
  team1,
  team2,
  tournament,
  date,
  stage,
  lineup,
  stadium,
}) => {
  try {
    // Check if a value is provided for date and convert it to Date type
    const matchDate = date ? new Date(date) : null;

    // Create new match stats for each team
    const matchStatsTeam1 = await MatchStats.create({
      redCards: [],
      yellowCards: [],
      assisters: [],
      scorers: [],
      score: null,
    });

    const matchStatsTeam2 = await MatchStats.create({
      redCards: [],
      yellowCards: [],
      assisters: [],
      scorers: [],
      score: null,
    });

    // Create a new match document with provided values or defaults (null or 0)
    const newMatch = await Match.create({
      team1: {
        _id: team1._id,
      },
      statsTeam1: matchStatsTeam1._id, // Use distinct name for team1's stats

      team2: {
        _id: team2._id,
      },
      statsTeam2: matchStatsTeam2._id, // Use distinct name for team2's stats

      tournament: tournament,
      date: matchDate,
      stage: stage || null,
      lineup: lineup || [],
      stadium: stadium ? stadium._id : null,
    });

    // Assign the match reference to matchStatsTeam1 and matchStatsTeam2
    matchStatsTeam1.match = newMatch._id;
    matchStatsTeam2.match = newMatch._id;
    matchStatsTeam1.team = newMatch.team1;
    matchStatsTeam2.team = newMatch.team2;

    // Save the updated match stats with match references
    await Promise.all([matchStatsTeam1.save(), matchStatsTeam2.save()]);

    // Populate the 'stats' field for team1 and team2
    const populatedMatch = await Match.findById(newMatch._id)
      .populate({ path: 'team1.statsTeam1', model: 'MatchStats' })
      .populate({ path: 'team2.statsTeam2', model: 'MatchStats' })
      .exec();

    console.log(populatedMatch);
    return populatedMatch;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};








const createKnockoutMatch = async (req, res) => {
  try {
    const { team1Id, team2Id, date } = req.body;
    const tournamentId = req.params.tournamentId;

    const team1 = await getTeamById(team1Id);
    const team2 = await getTeamById(team2Id);
    const stage = "Knockout Stage";

    if (!team1 || !team2) {
      return res.status(404).json({ message: 'One or both teams not found' });
    }

    // Ensure the date is a non-empty string
    if (typeof date !== 'string' || !date.trim()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const newMatch = await createMatch({
      team1,
      team2,
      tournament: tournamentId,
      date,
      stage, // Use the provided date string as is
      // Add other properties for the match
    });

    // Log specific properties of newMatch, not the entire object
    console.log({
      _id: newMatch._id,
      date: newMatch.date,
      // Add other properties you want to log
    });

    res.status(201).json(newMatch);
    return;
  } catch (error) {
    console.error('Error creating knockout match manually:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const createGroupMatches = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      throw { status: 404, message: 'Tournament not found' };
    }

    const matches = [];

    if (tournament.rules?.type === 'LEAGUE' || tournament.rules?.type === 'GROUP_KNOCKOUT') {
      tournament.groups.forEach(async (group) => { // Use async here
        const groupTeams = group.teams;

        for (let i = 0; i < groupTeams.length; i++) {
          for (let j = i + 1; j < groupTeams.length; j++) {
            const team1 = groupTeams[i];
            const team2 = groupTeams[j];

            const newMatch = new Match({
              team1,
              team2,
              tournament: tournament._id,
              stage: 'GROUP_STAGE', // Replace with the appropriate stage value
              date: null, // Set the date property to null
              // Add other properties for the match
            });

            // Save the new match to the database
            const savedMatch = await newMatch.save();

            matches.push(savedMatch);
          }
        }
      });
    } else {
      throw { status: 400, message: 'Invalid tournament type for creating group matches' };
    }

    return matches;
  } catch (error) {
    console.error('Error creating group matches:', error.message);
    throw { status: 500, message: 'Internal Server Error' };
  }
};




   const getTeamById = async (teamId) => {
     try {
       const team = await Team.findById(teamId);
       return team;
     } catch (error) {
       console.error('Error getting team by ID:', error.message);
       throw { status: 500, message: 'Internal Server Error' };
     }
   };

   const getAllMatchesForTournament = async (tournamentId) => {
    try {
      // Find all matches for the specified tournament ID
      const matches = await Match.find({ tournament: tournamentId });
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw { status: 500, message: 'Internal Server Error' };
    }
  };
  





  


module.exports = {
  getTournamentById,
  getTeamsInTournament,
  getAllTeamsInTournament,
  createKnockoutMatch,
  getTeamById,
  createGroupMatches,
  getAllMatchesForTournament,
  getMatchById,
  updateMatchDateById,
};

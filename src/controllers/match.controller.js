const Tournament = require('../models/tournament');

 const Team = require('../models/team');
 const Match = require('../models/matches');


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
const createMatch = async ({ team1, team2, tournament, date, stage }) => {
  try {
    // Assuming you have a Match model with 'stage' and 'date' as required fields
    const newMatch = new Match({
      team1,
      team2,
      tournament,
      stage, // Replace with the actual stage value
      date,      // Use the provided date string as is
      // Add other properties for the match
    });

    // Save the new match to the database
    const savedMatch = await newMatch.save();
    return savedMatch;
  } catch (error) {
    console.error('Error creating match:', error.message);
    throw { status: 500, message: 'Internal Server Error' };
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
    // console.log({
    //   _id: newMatch._id,
    //   date: newMatch.date,
    //   // Add other properties you want to log
    // });

    res.status(201).json(newMatch);
    return;
  } catch (error) {
    console.error('Error creating knockout match manually:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
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
      tournament.groups.forEach((group) => {
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

            matches.push(newMatch);
            
            

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


module.exports = {
  getTournamentById,
  getTeamsInTournament,
  getAllTeamsInTournament,
  createKnockoutMatch,
  getTeamById,
  createGroupMatches,
  // Add other match-related functions as needed
};

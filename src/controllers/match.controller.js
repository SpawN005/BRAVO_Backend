const Tournament = require("../models/tournament");
const MatchStatController = require("../controllers/matchStat.controller");
const Team = require("../models/team");
const Match = require("../models/matches");
const MatchStats = require("../models/matchStats");
const Player = require("../models/players");
const matchStats = require("../models/matchStats");
const matches = require("../models/matches");

// Initialize Socket.IO instance (assuming you have already created an HTTP server)
async function getMatchesByTeamId(teamId) {
  try {
    const matches = await Match.find({
      $or: [{ team1: teamId }, { team2: teamId }],
    }).populate("team1 team2");
    return matches;
  } catch (error) {
    console.error("Error fetching matches by team ID:", error);
    throw error;
  }
}
async function getMatcheByTeams(teamId1, teamId2, tournamentId) {
  try {
    const matches = await Match.find({
      $and: [
        {
          tournament: tournamentId,
          $or: [
            { $and: [{ team1: teamId1 }, { team2: teamId2 }] },
            { $and: [{ team1: teamId2 }, { team2: teamId1 }] },
          ],
        },
      ],
    }).populate("team1 team2");
    return matches;
  } catch (error) {
    console.error("Error fetching matche by teams:", error);
    throw error;
  }
}
const getMatch = async (matchId) => {
  console.log(matchId);
  try {
    // Find the match by ID
    const match = await Match.findById(matchId);
    console.log(match);
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }
    return match;
  } catch (error) {
    console.error("Error getting match by ID:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    };
  }
};

const getMatchById = async (matchId) => {
  try {
    // Find the match by ID
    const match = await Match.findById(matchId).populate({
      path: "stadium referee",
    });
    console.log(match);
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    try {
      const matchStat1 = await MatchStatController.getMatchStats(
        matchId,
        match.team1._id
      );
    } catch {
      const newMatchStat1 = new matchStats({
        match: match._id,
        team: match.team1._id,
      });

      await newMatchStat1.save();
    }
    try {
      const matchStat2 = await MatchStatController.getMatchStats(
        matchId,
        match.team2._id
      );
    } catch {
      const newMatchStat2 = new matchStats({
        match: match._id,
        team: match.team2._id,
      });

      await newMatchStat2.save();
    }

    // Find the teams by their IDs
    const team1 = await Team.findById(match.team1).populate("lineup");
    const team2 = await Team.findById(match.team2).populate("lineup");

    const team1Stats = await MatchStats.findOne({
      match: matchId,
      team: match.team1,
    });
    const team2Stats = await MatchStats.findOne({
      match: matchId,
      team: match.team2,
    });

    if (!team1 || !team2) {
      throw { status: 404, message: "One or more teams not found" };
    }

    // Add the team names to the match object
    const matchWithTeamNames = {
      ...match.toObject(),
      team1Name: team1.name,
      team2Name: team2.name,

      team1: {
        ...team1.toObject(),
        stats: team1Stats.toObject(),
      },
      team2: {
        ...team2.toObject(),
        stats: team2Stats.toObject(),
      },
    };

    return matchWithTeamNames;
  } catch (error) {
    console.error("Error getting match by ID:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    };
  }
};

const getTournamentById = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }
    console.log(tournament);
    return tournament;
  } catch (error) {
    console.error("Error getting tournament by ID:", error.message);
    throw { status: 500, message: "Internal Server Error" };
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
    console.error("Error getting teams in tournament:", error.message);
    throw { status: 500, message: "Internal Server Error" };
  }
};

const getAllTeamsInTournament = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    console.log("Tournament:", tournament); // Log the entire tournament object

    const teams = [];

    // Check the type of the tournament
    switch (tournament?.rules?.type) {
      case "LEAGUE":
      case "GROUP_KNOCKOUT":
        // Iterate through groups and teams
        tournament.groups.forEach((group) => {
          group.teams.forEach((team) => {
            teams.push({ teamId: team, groupName: group.name });
          });
        });
        break;

      case "KNOCKOUT":
        // For knockout, teams are directly in the main group
        tournament.groups[0]?.teams.forEach((team) => {
          teams.push({ teamId: team, groupName: tournament.groups[0]?.name });
        });
        break;

      default:
        throw { status: 500, message: "Unsupported tournament type" };
    }

    return teams;
  } catch (error) {
    console.error("Error getting teams in tournament:", error.message);
    throw { status: 500, message: "Internal Server Error" };
  }
};

const createGroupMatches = async (tournamentId) => {
  const matches = [];
  const groupMatches = [];
  try {
    const tournament = await Tournament.findById(tournamentId).populate(
      "groups.teams"
    );

    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    if (tournament?.rules?.type === "LEAGUE") {
      const groupTeams = tournament.groups.flatMap((group) => group.teams);

      for (let i = 0; i < groupTeams.length - 1; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const team1 = groupTeams[i];
          const team2 = groupTeams[j];

          const newMatch = new Match({
            team1,
            team2,
            tournament: tournament._id,
            stage: "LEAGUE",
            date: null,
            // Add other properties for the match
          });

          const savedMatch = await newMatch.save();

          matches.push(savedMatch);
        }
      }
    } else if (tournament?.rules?.type === "KNOCKOUT") {
      for (const group of tournament.groups) {
        const groupTeams = group.teams.map((team) => team._id);

        for (let i = 0; i < groupTeams.length; i += 2) {
          const team1 = groupTeams[i];
          const team2 = groupTeams[i + 1];

          const newMatch = new Match({
            team1,
            team2,
            tournament: tournament._id,
            stage: "KNOCKOUT",
            round: 1,
            nextMatch: null,
            isWinner: null,
            date: null,
          });

          groupMatches.push(newMatch);
        }
      }

      await Match.insertMany(groupMatches);
      matches.push(...groupMatches);

      let round = 2;
      let remainingMatches = matches.length;

      while (remainingMatches > 1) {
        const roundMatches = [];

        for (let i = 0; i < remainingMatches; i += 2) {
          const newMatch = new Match({
            team1: null,
            team2: null,
            tournament: tournament._id,
            stage: "KNOCKOUT",
            round: round,
            nextMatch: null,
            isWinner: null,
            date: null,
          });

          roundMatches.push(newMatch);
        }

        await Match.insertMany(roundMatches);
        matches.push(...roundMatches);

        remainingMatches = roundMatches.length;
        round++;
      }

      for (let i = 0, j = 0; i <= tournament.rules.nbTeams - 4; i += 2, j++) {
        matches[i].nextMatch =
          matches[i + tournament.rules.nbTeams / 2 - j]._id;
        matches[i + 1].nextMatch =
          matches[i + tournament.rules.nbTeams / 2 - j]._id;
      }

      await Promise.all(matches.map((match) => match.save()));

      console.log("Group Matches created:", matches.length);
    } else {
      throw {
        status: 400,
        message: "Invalid tournament type for creating league matches",
      };
    }

    return matches;
  } catch (error) {
    console.error("Error creating league matches:", error.message);
    throw { status: 500, message: "Internal Server Error" };
  }
};

const getTeamById = async (teamId) => {
  try {
    const team = await Team.findById(teamId);
    return team;
  } catch (error) {
    console.error("Error getting team by ID:", error.message);
    throw { status: 500, message: "Internal Server Error" };
  }
};

const getAllMatchesForTournament = async (tournamentId) => {
  try {
    // Find all matches for the specified tournament ID
    const matches = await Match.find({
      tournament: tournamentId,
    })
      .populate({
        path: "team1",
        select: "name stage logo",
      })
      .populate({
        path: "team2",
        select: "name stage logo",
      });
    return matches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw { status: 500, message: "Internal Server Error" };
  }
};
const getBracketForTournament = async (tournamentId) => {
  console.log(tournamentId);
  try {
    // Find all matches for the specified tournament ID, sorted by round
    const matches = await Match.find({
      tournament: tournamentId,
      stage: { $in: ["KNOCKOUT", "KNOCKOUT_STAGE"] },
    })
      .sort({ round: 1 })
      .populate({
        path: "team1",
        select: "name",
      })
      .populate({
        path: "team2",
        select: "name",
      });

    // Create an object to store rounds, using round number as keys
    const rounds = {};

    // Organize matches into the round structure
    matches.forEach((match) => {
      const { round, _id, date, team1, team2 } = match;

      // Check if the round already exists in the rounds object
      if (!rounds[round]) {
        // If the round doesn't exist, create a new round object
        rounds[round] = {
          title: `Round ${round}`,
          seeds: [],
        };
      }

      // Add the match data to the corresponding round
      rounds[round].seeds.push({
        id: _id,
        date: date ? new Date(date).toDateString() : null,
        teams: [
          { name: team1 ? team1.name : "TBD" },
          { name: team2 ? team2.name : "TBD" },
        ],
      });
    });

    // Convert the rounds object into an array of rounds
    const roundsArray = Object.values(rounds);
    console.log(roundsArray);
    return roundsArray;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw { status: 500, message: "Internal Server Error" };
  }
};

const getLiveMatches = async () => {
  try {
    const liveMatches = await Match.find({ status: "LIVE" }).populate(
      "team1 team2"
    );
    console.log(liveMatches);
    // Parcourir chaque match en direct
    const liveMatchesWithStats = await Promise.all(
      liveMatches.map(async (match) => {
        console.log("MatchStatController:", MatchStatController);

        // Obtenir les matchstats pour team1
        const matchStatsTeam1 = await MatchStatController.getMatchStats(
          match._id,
          match.team1._id
        );
        // Obtenir les matchstats pour team2
        const matchStatsTeam2 = await MatchStatController.getMatchStats(
          match._id,
          match.team2._id
        );

        return {
          ...match.toObject(), // Convertir l'objet match en objet javascript
          matchStatsTeam1,
          matchStatsTeam2,
        };
      })
    );

    return liveMatchesWithStats;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des matchs en direct :",
      error
    );
    throw new Error("Erreur lors de la récupération des matchs en direct.");
  }
};
const getMatchesByUserId = async (userId) => {
  try {
    const matches = await Match.find({
      $or: [{ referee: userId }, { observer: userId }],
    })
      .populate({
        path: "team1",
        select: "name score logo", // include only 'name' and 'score' fields
      })
      .populate({
        path: "team2",
        select: "name score logo", // include only 'name' and 'score' fields
      })
      .populate({
        path: "referee",
        select: "-userIdentity.password -userIdentity.email", // exclude 'password' and 'email' fields
      })
      .populate({
        path: "observer",
        select: "-userIdentity.password -userIdentity.email", // exclude 'password' and 'email' fields
      });

    return matches;
  } catch (error) {
    console.error("Error fetching matches by user ID:", error);
    throw { status: 500, message: "Internal Server Error" };
  }
};
const determineTopTeams = (tournamentId, groups, standings, numTopTeams) => {
  const topTeamsPerGroup = {};

  groups.forEach((group) => {
    const teamIds = group.teams.map((team) => team._id.toString());

    const groupStandings = standings.filter((standing) =>
      teamIds.includes(standing.team.toString())
    );

    groupStandings.sort(async (a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      } else if (a.goalDifference !== b.goalDifference) {
        return a.goalDifference > b.goalDifference ? a : b;
      } else if (a.goalsFor !== b.goalsFor) {
        return b.goalsFor - a.goalsFor;
      } else {
        const matches = await getMatcheByTeams(
          a.team._id,
          b.team._id,
          tournamentId
        );
        const matchWinner = matches[0].isWinner;
        return a.team._id.equals(matchWinner?._id) ? a : b;
      }
    });

    const topTeams = groupStandings
      .slice(0, numTopTeams)
      .map((standing) => standing.team);
    topTeamsPerGroup[group._id] = topTeams;
  });

  return topTeamsPerGroup;
};

const createGroupKnockoutMatches = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId).populate(
      "groups.teams"
    );

    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    const matches = [];

    // Create group stage matches
    const groupMatches = [];
    for (const group of tournament.groups) {
      const groupTeams = group.teams.map((team) => team._id);

      for (let i = 0; i < groupTeams.length; i += 2) {
        const team1 = groupTeams[i];
        const team2 = groupTeams[i + 1];

        const newMatch = new Match({
          team1,
          team2,
          tournament: tournament._id,
          stage: "GROUP_STAGE",
          round: 0,
          nextMatch: null,
          isWinner: null,
          date: null,
        });

        groupMatches.push(newMatch);
      }
    }

    // Insert group stage matches
    const insertedGroupMatches = await Match.insertMany(groupMatches);
    matches.push(...insertedGroupMatches);

    console.log("Group Stage Matches created:", insertedGroupMatches.length);

    // Create knockout stage matches
    let remainingMatches = tournament.groups.length * 2;
    let round = 1;
    const knock = [];
    while (remainingMatches > 1) {
      const roundMatches = [];
      for (let i = 0; i < remainingMatches; i += 2) {
        const newMatch = new Match({
          team1: null,
          team2: null,
          tournament: tournament._id,
          stage: "KNOCKOUT_STAGE",
          round: round,
          nextMatch: null,
          isWinner: null,
          date: null,
        });

        roundMatches.push(newMatch);
      }

      // Insert knockout stage matches
      const insertedRoundMatches = await Match.insertMany(roundMatches);
      matches.push(...insertedRoundMatches);
      knock.push(...insertedRoundMatches);
      remainingMatches = insertedRoundMatches.length;
      round++;
    }
    let test = tournament.groups.length * 2;

    // Set nextMatch for knockout stage matches
    for (let i = 0, j = 0; i <= test - 4; i += 2, j++) {
      knock[i].nextMatch = knock[i + test / 2 - j]._id;
      knock[i + 1].nextMatch = knock[i + test / 2 - j]._id;
    }

    // Save all matches
    await Promise.all(matches.map((match) => match.save()));

    console.log("Matches created:", matches.length);
    return matches;
  } catch (error) {
    console.error("Error creating matches:", error.message);
    throw { status: 500, message: "Internal Server Error" };
  }
};
const patchTMatchById = async (id, updates) => {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedMatch) {
      throw { status: 404, message: "Match not found" };
    }

    return updatedMatch;
  } catch (error) {
    console.error("Error updating match by ID:", error.message);
    throw {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    };
  }
};

module.exports = {
  getTournamentById,
  getTeamsInTournament,
  getAllTeamsInTournament,
  createGroupKnockoutMatches,
  getTeamById,
  createGroupMatches,
  getAllMatchesForTournament,
  getMatchById,
  getMatchesByUserId,
  getBracketForTournament,
  patchTMatchById,
  getMatchesByTeamId,
  getMatch,
  getLiveMatches,
  getMatcheByTeams,
  determineTopTeams,
};

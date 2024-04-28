const mongoose = require("mongoose");
const User = require("./users.js");

const type = ["LEAGUE", "KNOCKOUT", "GROUP_KNOCKOUT"];
const breakingRules = ["NOP", "GD", "GS", "HTH", "MW", "CG"];
const standingsSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
  },
  points: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  draws: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  goalsFor: {
    type: Number,
    default: 0,
  },
  goalsAgainst: {
    type: Number,
    default: 0,
  },
  goalDifference: {
    type: Number,
    default: 0,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  // Add other relevant standings attributes as needed
});
const ruleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: type,
    required: true,
  },
  nbTeams: {
    type: Number,
  },
  nbPlayerPerTeam: {
    type: Number,
  },
  teamsPerPool: {
    type: Number,
  },
  pointsPerWin: {
    type: Number,
  },
  pointsPerDraw: {
    type: Number,
  },
  pointsPerLoss: {
    type: Number,
  },
  tieBreakingRules: [
    {
      type: String,
      enum: breakingRules,
    },
  ],
});

const sponsorSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
    },
  ],
});
const groupModel = mongoose.model("Group", groupSchema);

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  location: {
    type: String,
  },
  rules: {
    type: ruleSchema,
  },
  tournamentWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
  },
  groups: [groupSchema], // Array of group objects
  sponsors: [sponsorSchema],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matches",
    },
  ],
  standings: {
    type: [standingsSchema],
    default: function () {
      return this.groups.reduce((acc, currGroup) => {
        currGroup.teams.forEach((team) => {
          acc.push({ team });
        });
        return acc;
      }, []);
    },
  },
});

tournamentSchema.statics.createGroups = async function (teams, teamsPerPool) {
  console.log(teamsPerPool);
  if (!teams || teams.length === 0 || !teamsPerPool) {
    throw new Error("Invalid teams or teamsPerPool provided");
  }

  const nbGroups = Math.ceil(teams.length / teamsPerPool);

  const groups = [];
  for (let i = 0; i < nbGroups; i++) {
    const groupName = `Group ${i + 1}`;
    const groupTeamSlice = teams.slice(
      i * teamsPerPool,
      (i + 1) * teamsPerPool
    );

    const group = new groupModel({
      name: groupName,
      teams: groupTeamSlice.map((team) => team),
    });

    await group.save();
    groups.push(group);
  }

  return groups;
};
tournamentSchema.statics.createGroup = async function (teams) {
  const groups = [];
  console.log(teams);
  const group = new groupModel({
    name: "group 1",
    teams: teams.map((team) => team),
  });

  await group.save();
  groups.push(group);

  return groups;
};
tournamentSchema.statics.findByOwner = async function (ownerId) {
  try {
    const tournaments = await this.find({ owner: ownerId }).select("-__v");
    if (!tournaments || tournaments.length === 0) {
      throw new Error("Tournaments not found for the owner");
    }
    return tournaments;
  } catch (error) {
    throw new Error(
      "Error finding tournaments for the owner: " + error.message
    );
  }
};
tournamentSchema.methods.getSortedStandings = function () {
  const groupedStandings = {};

  for (const group of this.groups) {
    const groupStandings = this.standings.filter((standing) =>
      group.teams.some((team) => team._id.equals(standing.team._id))
    );

    groupStandings.sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      } else if (a.goalDifference !== b.goalDifference) {
        return b.goalDifference - a.goalDifference;
      } else {
        return b.goalsFor - a.goalsFor;
      }
    });

    groupedStandings[group.name] = groupStandings;
  }

  return groupedStandings;
};
tournamentSchema.statics.StandingsUpdate = async function (
  tournamentId,
  scoreTeam1,
  scoreTeam2,
  match
) {
  try {
    const tournament = await this.findById(tournamentId);

    const team1Standings = tournament.standings.find(
      (standing) => String(standing.team) === String(match.team1)
    );
    const team2Standings = tournament.standings.find(
      (standing) => String(standing.team) === String(match.team2)
    );

    if (!team1Standings || !team2Standings) {
      throw new Error("Standings not found for one or both teams");
    }

    if (match.isWinner === match.team1) {
      team1Standings.points += tournament.rules.pointsPerWin;
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
      team1Standings.points += tournament.rules.pointsPerDraw;
      team1Standings.draws += 1;
      team1Standings.goalsFor += scoreTeam1;
      team1Standings.goalsAgainst += scoreTeam2;
      team1Standings.goalDifference = Math.abs(
        team1Standings.goalsFor - team1Standings.goalsAgainst
      );

      team2Standings.points += tournament.rules.pointsPerDraw;
      team2Standings.draws += 1;
      team2Standings.goalsFor += scoreTeam2;
      team2Standings.goalsAgainst += scoreTeam1;
      team2Standings.goalDifference = Math.abs(
        team2Standings.goalsFor - team2Standings.goalsAgainst
      );
    } else {
      team2Standings.points += tournament.rules.pointsPerWin;
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
    return tournament;
  } catch (error) {
    throw new Error("Error updating tournament standings: " + error.message);
  }
};

module.exports = mongoose.model("Tournaments", tournamentSchema);

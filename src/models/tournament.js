const mongoose = require("mongoose");
const User = require("./users.js");
const teamModel = require("./team.js");
const axios = require('axios');


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
  logo: {
    type: String,
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
  if (!teams || teams.length === 0 || !teamsPerPool) {
    throw new Error("Invalid teams or teamsPerPool provided");
  }
  
  try {
    const teamsgroup= await teamModel.find({ _id: { $in: teams } }).select('_id win lose score').lean();
    const transformedTeams = teamsgroup.map(team => ({
      _id: team._id.toString(),
      score: team.score,
      win: team.win,
      lose: team.lose
    }));
    
    const teamsgroupJson = JSON.stringify(transformedTeams);
    console.log("ttttttttt",teamsgroupJson)


    const response = await axios.post(
      'http://127.0.0.1:8000/group-teams',
      teamsgroupJson,
      {
        params: {
          num_teams: teamsPerPool
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    // Process the response from the Python endpoint
    if (response.status === 200) {
      const groups = response.data;
      console.log(groups)
      // Generate group names dynamically
      const numGroups = groups.length;
      const groupNames = Array.from({ length: numGroups }, (_, i) => `Group ${i + 1}`);

      // Create groups using received data
      const createdGroups = [];
      groups.forEach((groupData, index) => {
        const groupName = groupNames[index];
        const groupTeamSlice = groupData;
        
        const group = new groupModel({
          name: groupName,
          teams: groupTeamSlice.map((team) => team),
        });

        createdGroups.push(group);
      });

      return createdGroups;
    } else {
      throw new Error(`Failed to create groups. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error calling Python endpoint:", error); // Log the full error object

    throw new Error(`Error calling Python endpoint: ${error.message}`);
  }
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


module.exports = mongoose.model("Tournaments", tournamentSchema);

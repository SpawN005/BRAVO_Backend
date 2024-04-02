const mongoose = require("mongoose");
const User = require("./users.js");

const type = ["LEAGUE", "KNOCKOUT", "GROUP_KNOCKOUT"];
const breakingRules = ["NOP", "GD", "GS", "HTH", "MW", "CG"];

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
  groups: [groupSchema], // Array of group objects
  sponsors: [sponsorSchema],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matches",
    },
  ],
});

tournamentSchema.statics.createGroups = async function (teams, teamsPerPool) {
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

module.exports = mongoose.model("Tournaments", tournamentSchema);

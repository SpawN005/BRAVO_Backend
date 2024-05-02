var mongoose = require("mongoose");
const isEmpty = require("../utils/isEmpty.js");
const User = require("./users.js");

const teamSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    //required: true,
  },
  name: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  win: {
    type: Number,
    default: 0,
  },
  lose: {
    type: Number,
    default: 0,
  },
  nul: {
    type: Number,
    default: 0,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matches",
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  logo: {
    type: String,
  },
  lineup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

teamSchema.statics.findByManager = function (managerId) {
  return this.find({ manager: managerId });
};
teamSchema.statics.findByManagers = function (managerIds) {
  return this.find({ manager: { $in: managerIds } });
};

teamSchema.statics.getTeamByManagers = async function (managerEmails) {
  try {
    const users = await User.findByEmails(managerEmails);

    const managerIds = users.map((user) => user._id);

    const teams = await this.findByManagers(managerIds);

    if (!teams || teams.length === 0) {
      throw new Error("No teams found for the specified managers");
    }

    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

module.exports = mongoose.model("Teams", teamSchema);

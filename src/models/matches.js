const mongoose = require("mongoose");
const teamSchema = require("./team");
const userSchema = require("./users");
const stadiumSchema = require("./stadium");
const playersSchema = require("./players");

const statsSchema = new mongoose.Schema({
  redCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
  yellowCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
  assisters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
  scorers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],
});

const matchSchema = new mongoose.Schema({
  date: {
    type: Date,
    // required: true,
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournaments",
    required: true,
  },
  stage: {
    type: String, // "group" or "knockout"
    required: true,
  },
  // group: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Groups",
  // },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    score: {
      type: Number,
    },
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    score: {
      type: Number,
    },
    
  
  },
  lineup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Players",
    },
  ],

  // // referee: {
  // //   type: userSchema,
  // // },
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staduims",
  },
  stats: {
    type: statsSchema,
  },
});

module.exports = mongoose.model("Matches", matchSchema);

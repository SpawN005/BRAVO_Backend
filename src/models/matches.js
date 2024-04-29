const mongoose = require("mongoose");

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

  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    // required: true,
  },
  statsTeam1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatchStats",
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
    // required: true,
  },
  statsTeam2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatchStats",
  },
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stadiums",
  },
  observer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  isWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
  },
  nextMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Matches",
  },
  round: {
    type: Number,
  },
  status: {
    type: String,
    default: "UPCOMING",
  },
});

matchSchema.statics.findByDate = function (date) {
  return new Promise((resolve, reject) => {
    const givenDate = new Date(date);
    const twoHoursAgo = new Date(givenDate);
    twoHoursAgo.setHours(givenDate.getHours() - 2);
    const twoHoursLater = new Date(givenDate);
    twoHoursLater.setHours(givenDate.getHours() + 2);
    
    this.find({ date: { $gte: twoHoursAgo, $lte: twoHoursLater } })
      .exec(function (err, matches) {
        
          resolve(matches);
        
      });
  });
};

module.exports = mongoose.model("Matches", matchSchema);

var mongoose = require("mongoose");

const playersSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    // required: true
  },
  yellowCards: {
    type: Number,
    // required: true
  },
  redCards: {
    type: Number,
    // required: true
  },
  goalsScored: {
    type: Number,
    // required: true
  },
  cleanSheets: {
    type: Number,
    // required: true
  },
  assist: {
    type: Number,
    // required: true
  },
  logo:{
    type:String,
  },
  position: {
    type: String, // Vous pouvez modifier le type selon vos besoins, par exemple, Enum si vous utilisez TypeScript ou un ensemble limité de valeurs.
    // required: true
  },
});

module.exports = mongoose.model("Player", playersSchema);

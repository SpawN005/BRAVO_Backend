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
    default: 0    },
  redCards: {
    type: Number,
    default: 0    },
  goalsScored: {
    type: Number,
    default: 0  },
  cleanSheets: {
    type: Number,
    default: 0  },
  assist: {
    type: Number,
    default: 0  
    // required: true
  },
  logo:{
    type:String,
  },
  position: {
    type: String, 
  },
});

module.exports = mongoose.model("Player", playersSchema);

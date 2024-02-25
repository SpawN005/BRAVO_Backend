var mongoose = require("mongoose");
const isEmpty = require("../utils/isEmpty.js");
const userSchema = require("./users.js");
const teamSchema = new mongoose.Schema({
  manager: {
    type: String,
    //required: true,
  },
 name:{
  type: String,
  //required: true,
},

  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player', 
    },
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  score: {
    type: Number,
    // required: true
  },
  logo:{
    type:String,
  },
});
module.exports = mongoose.model("Teams", teamSchema);

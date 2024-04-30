var mongoose = require("mongoose");
const isEmpty = require("../utils/isEmpty.js");

/**
 * Permission Levels for User Schema:
 * 1. Observer
 * 2. Referee
 * 3. Manager
 * 4. Organizer
 * 5. Admin
 */

const userAdressSchema = mongoose.Schema({
  cp: {
    type: Number,
  },
  city: {
    type: String,
  },
  num: {
    type: Number,
    // required: true
  },
  street: {
    type: String,
  },
});
const userIdentitySchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      // required: true,
    },    
    solde: {
      type: Number,
      default: 5,
    },

    lastName: {
      type: String,
      // required: true,
    },
    phone: {
      type: String,
      // required: true
    },
  },
  { _id: false }
);
const subscriptionSchema = mongoose.Schema({
  sessionId: { type: String, required: true },
  planId: { type: String },
  startDate: { type: Date, default: Date.now() },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  price : {type:String},
  planType:{type: String},

},
{ _id: false }
);

const userSchema = mongoose.Schema({
  shouldReceiveInformations: {
    type: Boolean,
    default: false,
  },
  permissionLevel: {
    type: Number,
    default: 1,
  },
  userIdentity: {
    type: userIdentitySchema,
  },
  abonnement: {
    type: subscriptionSchema,
  },
  userAdress: {
    type: userAdressSchema,
  },
  tournamentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournaments", 
    },
  ],
});

User = mongoose.model("Users", userSchema);
//-------------------------------------------------------
exports.createUser = (userData) => {
  const user = new User(userData);
  return user.save().catch((e) => console.log(e));
};
//-------------------------------------------------------
exports.findById = (id) => {
  return User.findById(id).then((result) => {
    result = result.toJSON();
    delete result._id;
    delete result.__v;
    return result;
  });
};
//-------------------------------------------------------
exports.findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    User.find({ "userIdentity.email": email })
      .select("-__v")
      .exec(function (err, user) {
        if (err || isEmpty(user)) {
          reject(err);
        } else {
          resolve(user);
        }
      });
  });
};
//-------------------------------------------------------

exports.findByEmails = (emails) => {
  return new Promise((resolve, reject) => {
    User.find({ "userIdentity.email": { $in: emails } })
      .select("-__v")
      .exec(function (err, users) {
        if (err || !users) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};
//-------------------------------------------------------
exports.findByPermissionLevel = (level) => {
  return new Promise((resolve, reject) => {
    User.find({ permissionLevel: level })
      .select("-__v")
      .exec(function (err, users) {
        if (err || users.length === 0) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};
//-------------------------------------------------------

exports.findByTournamentId = (tournamentId) => {
  console.log(tournamentId);
  return new Promise((resolve, reject) => {
    User.find({ tournamentIds: mongoose.Types.ObjectId(tournamentId) })
      .select("-__v")
      .exec(function (err, users) {
        if (err || users.length === 0) {
          console.log(err);
          reject(
            err || new Error("No users found with the given tournament ID")
          );
        } else {
          resolve(users);
        }
      });
  });
};

//-------------------------------------------------------
exports.patchUser = (id, userData) => {
  return new Promise((resolve, reject) => {
    User.findById(id, function (err, user) {
      if (err) reject(err);
      else {
        for (let i in userData) {
          user[i] = userData[i];
        }
        user.save(function (err, updatedUser) {
          if (err) return reject(err);
          resolve(updatedUser);
        });
      }
    });
  });
};
//-------------------------------------------------------
exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    User.find()
      .select("-__v -userIdentity.password")
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};
//-------------------------------------------------------
exports.removeById = (userId) => {
  return new Promise((resolve, reject) => {
    User.deleteOne({ _id: userId }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};

exports.addTournament = async (userId, tournamentId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.userIdentity.solde <= 0) {
      throw new Error("Insufficient solde to create a tournament");
    }

    // Decrement solde by 1
    user.userIdentity.solde -= 1;

    user.tournamentIds = user.tournamentIds.filter((id) => id !== null);
    user.tournamentIds.push(tournamentId);

    await user.save();

    console.log("Tournament added to user:", user);

    return user;
  } catch (error) {
    console.error("Error adding tournament to user:", error);
    throw error;
  }
};



exports.getTournaments = async (id) => {
  try {
    const user = await User.findOne({ _id: id }).populate({
      path: "tournamentIds",
      select: "name tournamentWinner",
      populate: {
        path: "tournamentWinner",
        select: "name -_id",
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user tournaments:", error);
    throw error;
  }
};


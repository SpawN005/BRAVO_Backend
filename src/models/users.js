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
  userAdress: {
    type: userAdressSchema,
  },
});

const User = mongoose.model("Users", userSchema);
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

const User = require("../../models/users");
const isEmpty = require("../../utils/isEmpty");
const crypto = require("crypto");
const validator = require("validator");

exports.isPasswordAndUserMatch = (req, res, next) => {
  User.findByEmail(req.body.email)
    .then((user) => {
      if (!user[0]) {
        return res.status(404).send({
          code: 404,
          status: "not found",
          message: "User not found",
        });
      } else {
        let passwordFields = user[0].userIdentity.password.split("$");
        let salt = passwordFields[0];
        let hash = crypto
          .createHmac("sha512", salt)
          .update(req.body.password)
          .digest("base64");
        if (hash === passwordFields[1]) {
          req.body = {
            userId: user[0]._id,
            permissionLevel: user[0].permissionLevel,
            shouldReceiveInformations: user[0].shouldReceiveInformations,
            provider: "email",
            userIdentity: user[0].userIdentity,
            userAdress: user[0].userAdress,
          };
          return next();
        } else {
          return res.status(401).send({
            code: 401,
            status: "unauthorized",
            message: "Invalid password",
          });
        }
      }
    })
    .catch(() => {
      return res.status(404).send({
        code: 404,
        status: "not found",
        message: "User not found",
      });
    });
};

exports.hasAuthValidFields = (req, res, next) => {
  let errors = {};
  let data = {
    email: req.body.email,
    password: req.body.password,
  };
  let entries = Object.entries(data);

  if (!validator.isEmail(data.email)) {
    errors.email = "invalid email format";
  }
  for (const [key, value] of entries) {
    if (isEmpty(value)) {
      errors[`${key}`] = key + " is required";
    }
  }
  console.warn(errors);
  if (isEmpty(errors)) {
    next();
  } else {
    return res.status(400).send({
      code: 400,
      status: "bad request",
      message: "Errors detected",
      errors: errors,
    });
  }
};

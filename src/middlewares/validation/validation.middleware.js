var jwt = require("jsonwebtoken");
const validator = require("validator");
const isEmpty = require("../../utils/isEmpty");
// const isPhone = require("../../utils/isPhone");

exports.validJWTNeeded = (req, res, next) => {
  console.log(req.headers)
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(401).send({
          code: 401,
          status: "unauthorized",
          message: "Invalid authorization",
        });
      } else {
        req.jwt = jwt.verify(authorization[1], "SECRET");
        console.log("req.jwt", req.jwt);
        return next();
      }
    } catch (err) {
      return res.status(403).send({
        code: 403,
        status: "forbidden",
        message: "Invalid token",
      });
    }
  } else {
    return res.status(401).send({
      code: 401,
      status: "unauthorized",
      message: "Invalid request",
    });
  }
};

exports.validateRegisterInput = (req, res, next) => {
  let errors = {};
  let data = {
    email: req.body.email,
    password: req.body.password,
  };
  let entries = Object.entries(data);

  if (!validator.isEmail(data.email)) {
    errors.email = "invalid email format";
  }
  // if (!isEmpty(data.phone) && !isPhone(data.phone)) {
  //   errors.phone = "invalid phone number";
  // }
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

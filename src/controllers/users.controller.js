var UserModel = require("../models/users");
var crypto = require("crypto");
//-------------------------------------------------------------
// Inserting
exports.insert = (req, res) => {
  UserModel.findByEmail(req.body.email)
    .then(() => {
      res.status(409).send({
        code: 409,
        status: "conflict",
        message: "Email already exists",
      });
    })
    .catch(() => {
      let salt = crypto.randomBytes(16).toString("base64");
      let hash = crypto
        .createHmac("sha512", salt)
        .update(req.body.password)
        .digest("base64");
      req.body.password = salt + "$" + hash;
      // req.body.permissionLevel = 1;
      UserModel.createUser({ userIdentity: req.body }).then((result) => {
        if (result != undefined) {
          result = result.toJSON();
          delete result.__v;
          delete result.userIdentity.password;
        }
        result != undefined
          ? res.status(201).send({
              code: 201,
              status: "created",
              data: result,
            })
          : res.status(400).send({
              code: 400,
              status: "bad request",
              message: "Invalid user object",
            });
      });
    });
};
//-------------------------------------------------------------
// Fetching by Id
exports.getById = (req, res) => {
  UserModel.findById(req.params.userId)
    .then((result) => {
      res.status(200).send({
        code: 200,
        status: "success",
        data: result,
      });
    })
    .catch(() =>
      res.status(404).send({
        code: 404,
        status: "not found",
        message: "User not found, retry with a valid userId",
      })
    );
};
//-------------------------------------------------------------
// Updating
exports.patchById = (req, res) => {
  if (req.body.password) {
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(req.body.password)
      .digest("base64");
    req.body.password = salt + "$" + hash;
  }
  UserModel.patchUser(req.params.userId, req.body)
    .then((result) => {
      res.status(200).send({
        code: 200,
        status: "success",
        data: result,
      });
    })
    .catch(() =>
      res.status(404).send({
        code: 404,
        status: "not found",
        message: "User not found, retry with a valid userId.",
      })
    );
};
//-------------------------------------------------------------
// Fetching users
exports.list = (req, res) => {
  let limit =
    req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  UserModel.list(limit, page).then((result) => {
    res.status(200).send({
      code: 200,
      status: "success",
      data: result,
    });
  });
};
//-------------------------------------------------------------
// Deleting by Id
exports.removeById = (req, res) => {
  UserModel.removeById(req.params.userId)
    .then((result) => {
      res.status(204).send({
        code: 204,
        status: "success",
      });
    })
    .catch(() =>
      res.status(404).send({
        code: 404,
        status: "not found",
        message: "User not found, retry with a valid userId",
      })
    );
};

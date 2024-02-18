var UserModel = require("../models/users.model");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
//-------------------------------------------------------------
// Login
exports.login = (req, res) => {
  try {
    let refreshId = req.body.userId + "SECRET";
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(refreshId)
      .digest("base64");
    req.body.refreshKey = salt;
    let token = jwt.sign(req.body, "SECRET");
    let b = new Buffer.from(hash);
    let refresh_token = b.toString("base64");
    res.status(200).send({
      code: 200,
      status: "success",
      data: { accessToken: token, refreshToken: refresh_token },
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      status: "internal server error",
      message: "Errors detected",
      errors: err,
    });
  }
};

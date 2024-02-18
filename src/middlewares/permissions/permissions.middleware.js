var jwt = require("jsonwebtoken");

exports.minimumPermissionLevelRequired = (requiredPermissionLevel) => {
  return (req, res, next) => {
    let userPermissionLevel = parseInt(req.jwt.permissionLevel);
    let userId = req.jwt.userId;
    if (userPermissionLevel >= requiredPermissionLevel) {
      return next();
    } else {
      return res.status(403).send({
        code: 403,
        status: "forbidden",
        message: "insufficient permissions",
      });
    }
  };
};

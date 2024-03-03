var UserModel = require("../models/users");
var crypto = require("crypto");
const { generateRandomPassword } = require('../utils/passwordUtils'); // Adjust the path as needed

//-------------------------------------------------------------
// Inserting
exports.insert = (req, res) => {
  console.log(req.body)
  UserModel.findByEmail(req.body.email)
    .then(() => {
      res.status(409).send({
        code: 409,
        status: "conflict",
        message: "Email already exists",
      });
    })
    .catch(() => {
      let permissionLevel = req.body.permissionLevel || 1;

      // Generate a random password for permission levels 1, 2, or 3
      if ([1, 2, 3].includes(permissionLevel)) {
        const randomPassword = generateRandomPassword();
        console.log(`Generated password for ${req.body.email}: ${randomPassword}`);
        // Placeholder for sending email - to be implemented later
        // sendPasswordEmail(req.body.email, randomPassword);

        let salt = crypto.randomBytes(16).toString("base64");
        let hash = crypto.createHmac("sha512", salt).update(randomPassword).digest("base64");
        req.body.password = salt + "$" + hash;
      } else {
        let salt = crypto.randomBytes(16).toString("base64");
        let hash = crypto.createHmac("sha512", salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
      }

      let newUser = {
        userIdentity: req.body,
        permissionLevel: permissionLevel,
        tournamentIds: [req.body.tournamentId] // Add tournamentId to the array

      };

      UserModel.createUser(newUser).then((result) => {
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
  console.log(req.body )
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
  console.log(req.body)
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


exports.getObserversByTournamentId = (req, res) => {
  // Assuming 'tournamentsId' is the field in the UserModel that stores tournament IDs
  UserModel.findByTournamentId( req.params.tournamentId )
      .then((observers) => {
        
          if (observers.length > 0) {
              res.status(200).send({
                  code: 200,
                  status: "success",
                  data: observers,
              });
          } else {
              res.status(404).send({
                  code: 404,
                  status: "not found",
                  message: "No observers found for the given tournament ID",
              });
          }
      })
      .catch((error) => 
          res.status(500).send({
              code: 500,
              status: "error",
              message: "An error occurred while fetching observers",
              error: error
          })
      );
};

exports.getRefereesByTournamentId = (req, res) => {
  UserModel.findByTournamentId(req.params.tournamentId)
    .then((users) => {
        // Filter users by permissionLevel
        const referees = users.filter(user => user.permissionLevel === 3);

        if (referees.length > 0) {
            res.status(200).send({
                code: 200,
                status: "success",
                data: referees,
            });
        } else {
            res.status(404).send({
                code: 404,
                status: "not found",
                message: "No referees found for the given tournament ID",
            });
        }
    })
    .catch((error) => 
        res.status(500).send({
            code: 500,
            status: "error",
            message: "An error occurred while fetching referees",
            error: error
        })
    );
};

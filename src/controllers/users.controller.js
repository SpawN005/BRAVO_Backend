var UserModel = require("../models/users");
var crypto = require("crypto");
const { generateRandomPassword } = require("../utils/passwordUtils"); // Adjust the path as needed

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
     // Map roles to permission levels
     const rolePermissionMapping = {
      'OBSERVER': 1,
      'REFEREE': 2,
      'MANAGER': 3,
      'ORGANIZER': 4
    };
    
    let permissionLevel = rolePermissionMapping[req.body.role] || req.body.permissionLevel;


        let salt = crypto.randomBytes(16).toString("base64");
        let hash = crypto
          .createHmac("sha512", salt)
          .update(req.body.password)
          .digest("base64");
        req.body.password = salt + "$" + hash;
      
      console.log(req.body)
      console.log(permissionLevel)
      let newUser = {
        userIdentity: req.body,
        permissionLevel: permissionLevel,
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
  console.log(req.body);
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
  console.log(req.body);
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
  console.log(req.params.tournamentId);

  UserModel.findByTournamentId(req.params.tournamentId)
    .then((users) => {
      const observers = users.filter((user) => user.permissionLevel === 1);

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
        error: error,
      })
    );
};
exports.getObservers = (req, res) => {
  UserModel.findByPermissionLevel(2)
    .then((users) => {
      const observers = users;
      console.log("observers", observers);
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
          message: "No observers found ",
        });
      }
    })
    .catch((error) =>
      res.status(500).send({
        code: 500,
        status: "error",
        message: "An error occurred while fetching observers",
        error: error,
      })
    );
};
exports.getReferees = (req, res) => {
  UserModel.findByPermissionLevel(1)
    .then((users) => {
      const Referees = users;
      if (Referees.length > 0) {
        res.status(200).send({
          code: 200,
          status: "success",
          data: Referees,
        });
      } else {
        res.status(404).send({
          code: 404,
          status: "not found",
          message: "No Referees found ",
        });
      }
    })
    .catch((error) =>
      res.status(500).send({
        code: 500,
        status: "error",
        message: "An error occurred while fetching Referees",
        error: error,
      })
    );
};
exports.getRefereesByTournamentId = (req, res) => {
  UserModel.findByTournamentId(req.params.tournamentId)
    .then((users) => {
      // Filter users by permissionLevel
      const referees = users.filter((user) => user.permissionLevel === 3);
      console.log(referees);
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
        error: error,
      })
    );
};

const sendPasswordEmail = async (email, password) => {
  let transporter = nodemailer.createTransport({
    // Configure the transporter with your email service details
    service: "your_email_service", // e.g., 'gmail'
    auth: {
      user: "your_email_address",
      pass: "your_email_password",
    },
  });

  let mailOptions = {
    from: "your_email_address",
    to: email,
    subject: "Your New Password",
    text: `Your new password is: ${password}`,
    // You can also use HTML body content
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
exports.addTournament = (req, res) => {
  console.log(req.params.userId);

  UserModel.addTournament(req.params.userId, req.body.tournamentId)
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.status(404).send({
          code: 404,
          status: "not found",
          message: "User not found",
        });
      }
    })
    .then(() => {
      res.status(200).send({
        code: 200,
        status: "success",
        message: "Tournament added to user",
      });
    })
    .catch((error) => {
      console.error("Error:", error);

      // Handle different types of errors appropriately
      if (error.name === "CastError") {
        return res.status(400).send({
          code: 400,
          status: "bad request",
          message: "Invalid user ID",
        });
      }

      res.status(500).send({
        code: 500,
        status: "error",
        message: "An error occurred while processing the request",
        error: error.message, // Send only the error message for security reasons
      });
    });
};
exports.getTournaments = async (req, res) => {
  try {
    const user = await UserModel.getTournaments(req.params.userId);

    if (!user) {
      return res.status(404).send({
        code: 404,
        status: "not found",
        message: "User not found, retry with a valid userId",
      });
    }

    res.status(200).send({
      code: 200,
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user tournaments:", error);
    res.status(500).send({
      code: 500,
      status: "error",
      message: "An error occurred while fetching user tournaments",
      error: error.message,
    });
  }
};

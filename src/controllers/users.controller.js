var UserModel = require("../models/users");
var MatchModel = require("../models/matches");
var crypto = require("crypto");
const { generateRandomPassword } = require("../utils/passwordUtils"); // Adjust the path as needed
const team = require("../models/team");
const tournament = require("../models/tournament");

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
      const rolePermissionMapping = {
        OBSERVER: 1,
        REFEREE: 2,
        MANAGER: 3,
        ORGANIZER: 4,
      };

      // Determine permission level either from the role or directly from the request
      let permissionLevel = req.body.role
        ? rolePermissionMapping[req.body.role.toUpperCase()]
        : req.body.permissionLevel;

      let passwordToHash = req.body.password;

      // If the role leads to permission level 1 or 2, or it's set directly, generate a random password
      if (!passwordToHash && [1, 2].includes(permissionLevel)) {
        const randomPassword = generateRandomPassword();
        console.log(
          `Generated password for ${req.body.email}: ${randomPassword}`
        );
        // sendPasswordEmail(req.body.email, randomPassword); // Implement this function as needed

        passwordToHash = randomPassword;
      }

      // Hash the password
      let salt = crypto.randomBytes(16).toString("base64");
      let hash = crypto
        .createHmac("sha512", salt)
        .update(passwordToHash)
        .digest("base64");
      req.body.password = salt + "$" + hash;

      let newUser = {
        userIdentity: {
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: req.body.password,
        },
        permissionLevel: permissionLevel,
        tournamentIds: req.body.tournamentId ? [req.body.tournamentId] : [],
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
  console.log(req.body.userIdentity);

  if (req.body.userIdentity.password) {
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
  UserModel.findByPermissionLevel(1)
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
exports.getAvailableObservers = async (req, res) => {
  try {
    const observers = await UserModel.findByPermissionLevel(1);

    const matches = await MatchModel.findByDate(req.params.date);
    const assignedObserverIds = matches.map((match) => match.observer);
    const availableObservers = observers.filter((observer) => {
      return !assignedObserverIds.find((id) => id.equals(observer._id));
    });

    res.status(200).send({
      code: 200,
      status: "success",
      data: availableObservers,
    });
  } catch (error) {
    console.error("Error fetching available observers:", error);
    res.status(500).send({
      code: 500,
      status: "error",
      message: "An error occurred while fetching available observers",
      error: error?.message,
    });
  }
};

exports.getReferees = (req, res) => {
  UserModel.findByPermissionLevel(2)
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
exports.getAvailableReferees = async (req, res) => {
  try {
    const referees = await UserModel.findByPermissionLevel(2);
    const matches = await MatchModel.findByDate(req.params.date);
    const assignedRefereeIds = matches.map((match) => match.referee);
    const availablReferees = referees.filter((referee) => {
      return !assignedRefereeIds.find((id) => id.equals(referee._id));
    });
    res.status(200).send({
      code: 200,
      status: "success",
      data: availablReferees,
    });
  } catch (error) {
    console.error("Error fetching available observers:", error);
    res.status(500).send({
      code: 500,
      status: "error",
      message: "An error occurred while fetching available observers",
      error: error.message,
    });
  }
};
exports.getRefereesByTournamentId = (req, res) => {
  UserModel.findByTournamentId(req.params.tournamentId)
    .then((users) => {
      // Filter users by permissionLevel
      const referees = users.filter((user) => user.permissionLevel === 2);
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

      if (error.message === "Insufficient solde to create a tournament") {
        return res.status(400).send({
          code: 400,
          status: "bad request",
          message: "Insufficient solde to create a tournament",
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
      data: user.tournamentIds,
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
exports.getStats = async (req, res) => {
  try {
    // Fetch the user based on userId
    const user = await UserModel.findById(req.params.userId);
    console.log("aze", user);
    // If user not found, return an error response
    if (!user) {
      return res.status(404).json({
        code: 404,
        status: "not found",
        message: "User not found. Please provide a valid userId.",
      });
    }

    // Initialize an object to store user statistics
    const userStats = {};
    // Handle statistics based on user's permission level
    switch (user.permissionLevel) {
      case 1:
        // Observer statistics
        userStats.upcomingMatches = await MatchModel.countDocuments({
          observer: user._id,
          status: "UPCOMING",
        });
        userStats.finishedMatches = await MatchModel.countDocuments({
          observer: user._id,
          status: "FINISHED",
        });
        userStats.liveMatches = await MatchModel.countDocuments({
          observer: user._id,
          status: "LIVE",
        });
        break;

      case 3:
        // Manager statistics
        const teamsManaged = await team
          .find({ manager: user._id })
          .select("players");

        userStats.playerCount = teamsManaged.reduce(
          (sum, team) => sum + team.players.length,
          0
        );

        userStats.matchLost = await team
          .find({
            manager: user._id,
          })
          .select("lose -_id")
          .lean();
        userStats.matchWon = await team
          .find({
            manager: user._id,
          })
          .select("win -_id")
          .lean();
        userStats.matchNul = await team
          .find({
            manager: user._id,
          })
          .select("nul -_id")
          .lean();

        userStats.matchPlayed =
          userStats.matchNul[0].nul +
          userStats.matchWon[0].win +
          userStats.matchLost[0].lose;
        const managedTeams = await team
          .find({ manager: user._id })
          .select("_id")
          .lean();

        const matchesPlayed = await MatchModel.find({
          $or: [
            { team1: { $in: managedTeams[0] } },
            { team2: { $in: managedTeams[0] } },
          ],
          tournament: { $exists: true },
        })
          .select("tournament")
          .lean();

        const uniqueTournaments = new Set(
          matchesPlayed.map((match) => match.tournament)
        );

        userStats.tournamentPlayed = uniqueTournaments.size;

        break;

      case 4:
        // Organizer statistics
        const currentDate = new Date();

        // Number of finished tournaments
        userStats.finishedTournaments = await tournament.countDocuments({
          _id: { $in: user.tournamentIds },
          endDate: { $lt: currentDate }, // End date is in the past
        });

        // Number of ongoing tournaments
        userStats.ongoingTournaments = await tournament.countDocuments({
          _id: { $in: user.tournamentIds },
          startDate: { $lte: currentDate }, // Start date is in the past or today
          endDate: { $gte: currentDate }, // End date is in the future or today
        });

        // Total count of tournaments
        userStats.tournamentCount = user.tournamentIds.length;
        break;

      default:
        // Handle invalid permission levels
        return res.status(400).json({
          code: 400,
          status: "bad request",
          message: "Invalid permission level.",
        });
    }
    userStats.permissionLevel = user.permissionLevel;

    // Return the collected statistics
    res.status(200).json({
      code: 200,
      status: "success",
      data: userStats,
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "An error occurred while fetching user statistics.",
      error: error.message,
    });
  }
};

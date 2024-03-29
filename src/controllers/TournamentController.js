var TournamentModel = require("../models/tournament");
var UsersModel = require("../models/users");
var TeamModel = require("../models/team");

var TournamentsController = {
  insert: async function (req, res) {
    if (!req.body) {
      return res.status(400).send({
        message: "Tournament data can not be empty",
      });
    }

    const tournamentData = {
      name: req.body.name,
      owner: req.body.owner,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      location: req.body.location,
      rules: req.body.rules,
      groups: req.body.groups,
    };

    const teamsPerPool = tournamentData.rules.teamsPerPool;
    console.log("tpp", teamsPerPool);
    var Tgroups;
    switch (tournamentData.rules.type) {
      case "LEAGUE":
        Tgroups = await TournamentModel.createGroup(req.body.teams);

        break;
      case "KNOCKOUT":
        Tgroups = await TournamentModel.createGroups(
          req.body.teams,
          2
        );
        break;
      case "GROUP_KNOCKOUT":
        Tgroups = await TournamentModel.createGroups(
          req.body.teams,
          teamsPerPool
        );
        break;
      default:
        console.log("Unsupported tournament type");
    }

    tournamentData.groups = Tgroups;

    const newTournament = new TournamentModel(tournamentData);

    try {
      await newTournament.save();

      res.status(201).send(newTournament);
    } catch (err) {
      res.status(500).send({
        message: "Error occurred while creating the tournament",
        error: err,
      });
    }
  },
  getAll: function (req, res) {
    TournamentModel.find({}, function (err, tournaments) {
      if (err) {
        return res
          .status(500)
          .send({ message: "Error occurred while retrieving tournaments" });
      }
      res.status(200).send(tournaments);
    });
  },

  getById: function (req, res) {
    TournamentModel.findById(req.params.id)
      .populate("groups.teams")
      .exec(function (err, tournament) {
        if (err) {
          return res.status(500).send({
            message: "Error occurred while retrieving the tournament",
          });
        }
        if (!tournament) {
          return res.status(404).send({ message: "Tournament not found" });
        }
        res.status(200).send(tournament);
      });
  },
  getByIdOwner: async function (req, res) {
    try {
      const ownerId = req.params.id;
      const tournaments = await TournamentModel.findByOwner(ownerId);

      if (!tournaments || tournaments.length === 0) {
        return res
          .status(404)
          .send({ message: "Tournaments not found for the owner" });
      }

      res.status(200).send(tournaments);
    } catch (error) {
      console.error(
        "Error occurred while retrieving tournaments for the owner:",
        error
      );
      res
        .status(500)
        .send({ message: "Error occurred while retrieving the tournaments" });
    }
  },
  removeById: function (req, res) {
    TournamentModel.findByIdAndDelete(
      req.params.id,
      function (err, deletedDoc) {
        if (err) {
          return res.status(500).send(err.message);
        }
        if (!deletedDoc) {
          return res.status(404).send({ message: "Tournament not found" });
        }
        res.status(200).send("deleted");
      }
    );
  },
  patchTById: function (req, res) {
    const id = req.params.id;
    const updates = req.body;

    TournamentModel.findByIdAndUpdate(
      id,
      updates,
      { new: true },
      function (err, updatedTournament) {
        if (err) {
          return res.status(500).send({ message: "Error updating tournament" });
        }
        if (!updatedTournament) {
          return res.status(404).send({ message: "Tournament not found" });
        }
        res.status(200).send(updatedTournament);
      }
    );
  },
};

module.exports = TournamentsController;

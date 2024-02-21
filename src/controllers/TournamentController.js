var TournamentModel = require('../models/tournament');

var TournamentsController = {
    
    insert: function (req, res) {
        if (!req.body) {
            return res.status(400).send({
                message: "Tournament data can not be empty"
            });
        }

        const tournamentData = {
            name: req.body.name,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            location: req.body.location,
            rules: req.body.rules,
            groups: req.body.groups,
            matches: req.body.matches,
            // Include other fields as per your schema
        };

        const newTournament = new TournamentModel(tournamentData);

        newTournament.save(function (err, tournament) {
            if (err) {
                return res.status(500).send({
                    message: "Error occurred while creating the tournament",
                    error: err
                });
            }
            res.status(201).send(tournament);
        });
    
    },

    getAll: function (req, res) {
        TournamentModel.find({}, function(err, tournaments) {
            if (err) {
                return res.status(500).send({ message: "Error occurred while retrieving tournaments" });
            }
            res.status(200).send(tournaments);
        });
    },

    getById: function (req, res) {
        TournamentModel.findById(req.params.id, function(err, tournament) {
            if (err) {
                return res.status(500).send({ message: "Error occurred while retrieving the tournament" });
            }
            if (!tournament) {
                return res.status(404).send({ message: "Tournament not found" });
            }
            res.status(200).send(tournament);
        });
    }
};

module.exports = TournamentsController;

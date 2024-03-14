var TournamentModel = require('../models/tournament');
var UserModel = require('../models/users');

var TournamentsController = {
    insert: function (req, res) {
        console.log(req.body)
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
        };
    
        const newTournament = new TournamentModel(tournamentData);
        
        newTournament.save(function (err, tournament) {
            if (err) {
                console.error("Error saving tournament:", err);
                return res.status(500).send({
                    message: "Error occurred while creating the tournament",
                    error: err
                });
            }
            UserModel.findById(req.body.userId, function (err, user) {
            if (err) {
                console.error("Error finding user:", err);
                return res.status(500).send({
                    message: "Error finding user",
                    error: err
                });
            }

            if (!user) {
                console.log("User not found with ID:", req.body.userId);
                return res.status(404).send({
                    message: "User not found"
                });
            }

            console.log("User before update:", user);

            user.tournamentIds.push(tournament._id);

            console.log("User after update:", user);

            user.save(function (err) {
                if (err) {
                    console.error("Error saving user:", err);
                    return res.status(500).send({
                        message: "Error updating user with new tournament",
                        error: err
                    });
                }

                console.log("Updated user:", user);
                res.status(201).send(tournament);
            });
        });
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

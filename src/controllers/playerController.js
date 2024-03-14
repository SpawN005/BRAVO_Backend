const Players = require('../models/players')
const Teams = require('../models/team')


exports.createPlayer = async (req, res) => {
    try {
        const player = new Players(req.body);
        if(req.file){
            player.logo= req.file.path
        }
        await player.save();
        res.status(201).send(player);
    } catch (error) {
        res.status(400).send(error);
    }
};


// Contrôleur pour récupérer tous les joueurs
exports.getAllPlayers = async (req, res) => {
    try {
        const players = await Players.find({});
        res.send(players);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Contrôleur pour récupérer un joueur par ID
exports.getPlayerById = async (req, res) => {
    try {
        const player = await Players.findById(req.params.id);
        if (!player) {
            return res.status(404).send();
        }
        res.send(player);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Delete a user with the specified id in the request
exports.destroy = async (req, res) => {
    await Players.findByIdAndRemove(req.params.id).then(data => {
        if (!data) {
          res.status(404).send({
            message: `User not found.`
          });
        } else {
          res.send({
            message: "User deleted successfully!"
          });
        }
    }).catch(err => {
        res.status(500).send({
          message: err.message
        });
    });
};
// Contrôleur pour modifier un joueur par ID
exports.updatePlayerById = async (req, res) => {
    const updates = req.body;


    

    try {
        const player = await Players.findByIdAndUpdate(req.params.id, req.body, );

        if (!player) {
            return res.status(404).send();
        }

        res.send(player);
    } catch (error) {
        res.status(400).send(error);
    }
};
exports.assignPlayerToTeam = async (req, res) => {
    try {
        const player = new Players(req.body);
       
        await player.save();

        // Mettre à jour l'équipe en associant le joueur à l'équipe
        const teamId = req.params.teamId; // Supposons que vous envoyez l'ID de l'équipe depuis le frontend
        const team = await Teams.findById(teamId);
        if (!team) {
            return res.status(404).send({ message: 'Team not found' });
        }

        team.players.push(player._id); // Ajouter l'ID du joueur à la liste des joueurs de l'équipe
        await team.save();

        res.status(201).send(player);
    } catch (error) {
        res.status(400).send(error);
    }
};

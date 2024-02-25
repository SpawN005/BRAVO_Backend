const Players = require('../models/players')


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
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'email']; // Les champs autorisés à être mis à jour
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const player = await Players.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!player) {
            return res.status(404).send();
        }

        res.send(player);
    } catch (error) {
        res.status(400).send(error);
    }
};

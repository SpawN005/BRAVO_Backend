const Team = require("../models/team");
const Player = require("../models/players");
const User = require("../models/users");

// Méthode pour créer une équipe
exports.createTeam = async (req, res) => {
  try {
    const T = new Team(req.body);
    if (req.file) {
      T.logo = req.file.path;
    }
    // Sauvegarder l'équipe dans la base de données
    await T.save();
    res.status(201).json({ message: "Équipe créée avec succès", T });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Méthode pour ajouter des joueurs à une équipe
exports.addPlayersToTeam = async (req, res) => {
  try {
    const { teamId, playerIds } = req.body;
    // Recherchez l'équipe par son identifiant
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Équipe non trouvée" });
    }
    // Ajoutez les joueurs à l'équipe
    team.players.push(...playerIds);
    // Enregistrez les modifications dans la base de données
    await team.save();
    res
      .status(200)
      .json({ message: "Joueurs ajoutés à l'équipe avec succès", team });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Méthode pour récupérer toutes les équipes
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ajoutez d'autres méthodes pour récupérer une équipe par son identifiant, mettre à jour une équipe et supprimer une équipe selon vos besoins.
exports.addTeamAndPlayers = async (req, res) => {
  try {
    const { logo, country, city, name, players } = req.body;
    // 1. Validate input data
    if (!logo || !name || !city || !country || !players || !players.length) {
      return res.status(400).send("Missing required data");
    }

    // 2. Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(409).send("Team name already exists");
    }

    // 3. Create the team instance
    const team = new Team({ name, logo, city, country });
    if (req.file) {
      team.logo = req.file.path;
    }
    // 4. Create and link player instances
    const playerPromises = players.map(async (playerData) => {
      const player = new Player(playerData);
      await player.save();
      team.players.push(player._id);
      return player; // Store created player objects for response
    });

    const createdPlayers = await Promise.all(playerPromises);

    // 5. Save the team with populated players
    await team.save();

    // 6. Send successful response with created team and players
    res.status(201).send({ team, players: createdPlayers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
exports.getTeamById = async (req, res) => {
  try {
    const teamId = req.params.id;
    const team = await Team.findById(teamId).populate("players"); // Utilisation de populate pour récupérer les joueurs associés à l'équipe

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

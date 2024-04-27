// Importer les modules nécessaires
const express = require("express");
const router = express.Router();
const TeamController = require("../../controllers/TeamController");
const upload = require("../../middlewares/upload");
const path = require("path");
const Team = require("../../models/team");

router.post("/teams", upload.single("logo"), TeamController.createTeam);
router.get("/teams", TeamController.getAllTeams);
router.post("/teamP", upload.single("logo"), TeamController.addTeamAndPlayers);
router.get("/team/:id", TeamController.getTeamById);
router.get("/team/manager/:managerId", TeamController.getTeamsByManagerId);
router.post('/team/addToLineup/:teamId', async (req, res) => {
    const { teamId } = req.params;
    const { playerIds } = req.body;
  
    try {
      // Trouver l'équipe avec l'ID spécifié
      const team = await Team.findById(teamId);
  
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      // Supprimer l'ancienne lineup
      team.lineup = [];
  
      // Ajouter les nouveaux joueurs à la lineup
      playerIds.forEach(playerId => {
        team.lineup.push(playerId);
      });
  
      // Sauvegarder les modifications
      await team.save();
  
      res.status(200).json({ message: "Lineup updated successfully" });
    } catch (error) {
      console.error("Error updating lineup:", error);
      res.status(500).json({ error: "Error updating lineup" });
    }
  });
// Exporter le router
module.exports = router;

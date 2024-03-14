// Importer les modules nécessaires
const express = require("express");
const router = express.Router();
const TeamController = require("../../controllers/TeamController");
const upload = require("../../middlewares/upload");
const path = require("path");

router.post("/teams", upload.single("logo"), TeamController.createTeam);
router.get("/teams", TeamController.getAllTeams);
router.post("/teamP", upload.single("logo"), TeamController.addTeamAndPlayers);
router.get("/team/:id", TeamController.getTeamById);
router.get("/team/manager/:managerId", TeamController.getTeamsByManagerId);

// Exporter le router
module.exports = router;

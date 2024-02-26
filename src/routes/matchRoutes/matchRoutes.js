const express = require('express');
const MatchController = require('../../controllers/match.controller');
const router = express.Router();
const ValidationMiddleware = require('../../middlewares/validation/validation.middleware');




/**
 * @swagger
 * /matches/tournaments/{tournamentId}:
 *   get:
 *     tags:
 *       - matches
 *     description: Get tournament details by ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: tournamentId
 *         description: tournament id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament details
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/tournaments/:tournamentId', async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const tournament = await MatchController.getTournamentById(tournamentId);

    res.status(200).json(tournament);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});
router.get('/tournaments/teams/:tournamentId', async (req, res) => {
    try {
      const tournamentId = req.params.tournamentId;
      const teams = await MatchController.getAllTeamsInTournament(tournamentId);
  
      res.status(200).json(teams);
    } catch (error) {
      if (error.status) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  });
  router.post('/tournaments/:tournamentId/knockout', async (req, res) => {
    try {
        const { team1Id, team2Id, date } = req.body;
        const tournamentId = req.params.tournamentId;

        // Ensure that req.body is defined and contains the required properties
        if (!team1Id || !team2Id || !date) {
            return res.status(400).json({ message: 'Invalid request body' });
        }

        const match = await MatchController.createKnockoutMatch(req, res); // Pass req and res to the controller

        res.status(201).json(match);
    } catch (error) {
        console.error('Error creating knockout match manually:', error);
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
});
router.post('/tournaments/:tournamentId/group-matches', async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    const matches = await MatchController.createGroupMatches(tournamentId); // Pass tournamentId to the controller

    res.status(201).json(matches);
  } catch (error) {
    console.error('Error creating group matches:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

 router.get('/:teamId', async (req, res) => {
  try {
    // Trim the teamId to remove extra whitespace or newline characters
    const teamId = req.params.teamId.trim();

    // Get team details by ID
    const team = await MatchController.getTeamById(teamId);

    // Check if the team exists
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Return team details
    res.status(200).json(team);
  } catch (error) {
    console.error('Error getting team by ID:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;

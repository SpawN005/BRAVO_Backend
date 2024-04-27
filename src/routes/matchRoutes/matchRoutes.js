const express = require('express');
const MatchController = require('../../controllers/match.controller');
const router = express.Router();
const ValidationMiddleware = require('../../middlewares/validation/validation.middleware');


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
router.get('/matches/:teamId', async (req, res) => {
  const teamId = req.params.teamId;
  try {
    const matches = await MatchController.getMatchesByTeamId(teamId);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/teams/:tournamentId', async (req, res) => {
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
  router.post('/knockout/:tournamentId', async (req, res) => {
    try {
        const { team1Id, team2Id, date, referee, observer } = req.body;
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
router.post('/group-matches/:tournamentId', async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    const matches = await MatchController.createGroupMatches(tournamentId); // Pass tournamentId to the controller

    res.status(201).json(matches);
  } catch (error) {
    console.error('Error creating group matches:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

// one random match 
router.post('/random-match/:tournamentId', async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    const newMatch = await MatchController.createRandomMatch(req, res, tournamentId);

    res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error creating random match:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

//random match for all tournamants

router.post('/random-matches/:tournamentId', async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    const matches = await MatchController.createRandomKnockoutMatchesForTournament(tournamentId);

    res.status(201).json(matches);
  } catch (error) {
    console.error('Error creating random matches for tournament:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});




router.get('/matches/:tournamentId', async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    // Call the controller method to get all matches for the specified tournament ID
    const matches = await MatchController.getAllMatchesForTournament(tournamentId);

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

router.get('/:matchId', async (req, res) => {
  try {
    const matchId = req.params.matchId;

    // Call the controller method to get the match by ID
    const match = await MatchController.getMatchById(matchId);

    res.status(200).json(match);
  } catch (error) {
    console.error('Error getting match by ID:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

router.patch('update-date/:matchId', async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const newDate = req.body.date; // Assuming the new date is provided in the request body

    // Call the controller method to update the date of the match by ID
    const updatedMatch = await MatchController.updateMatchDateById(matchId, newDate);

    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Error updating match date by ID:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});


// not mine just for test 
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

router.post('/update-score', async (req, res) => {
  try {
    // Add logic to update the score
    const updatedScore = await MatchController.updatedScore(req.body);

    // Emit an event to notify clients about the updated score
    io.emit('scoreUpdated', { updatedScore });

    // Respond with the updated score
    res.status(200).json({ updatedScore });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const matches = await MatchController.getMatchesByUserId(userId);

    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches for user:', error);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
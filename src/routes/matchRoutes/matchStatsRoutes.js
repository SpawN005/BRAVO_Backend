const express = require("express");
const router = express.Router();
const matchController = require('../../controllers/match.controller');

// Route to handle match actions
router.post('/score/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer1, idplayer2, idteam } = req.body;
    const result = await matchController.scoreGoal(idmatch, idplayer1, idplayer2, idteam);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// lhistorique mta3 les actions fil tableau fil wosst

router.get('/matchStats/:matchId/:teamId', async (req, res) => {
  try {
    const { matchId, teamId } = req.params;

    // Call the getMatchStats function to retrieve match stats
    const matchStats = await matchController.getMatchStats(matchId, teamId);

    // Send the match stats as a response
    res.status(200).json(matchStats);
  } catch (error) {
    // Handle errors and send an appropriate response
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/cancelGoal/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer1, idplayer2, idteam } = req.body;

    const result = await matchController.cancelGoal(idmatch, idplayer1, idplayer2, idteam);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/yellow-card/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer, idteam } = req.body;

    const result = await matchController.addYellowCard(idmatch, idplayer, idteam);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;

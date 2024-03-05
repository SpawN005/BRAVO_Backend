const express = require("express");
const router = express.Router();
const matchStatController = require('../../controllers/matchStat.controller');

// Route to handle match actions
router.post('/score/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer1, idplayer2, idteam } = req.body;


    const result = await matchStatController.scoreGoal(idmatch, idplayer1, idplayer2, idteam);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// lhistorique mta3 les actions fil tableau fil wosst


router.post('/cancelGoal/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer1, idplayer2, idteam } = req.body;

    const result = await matchStatController.cancelGoal(idmatch, idplayer1, idplayer2, idteam);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/yellow-card/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer, idteam } = req.body;

    const result = await matchStatController.addYellowCard(idmatch, idplayer, idteam);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/red-card/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer, idteam } = req.body;

    const result = await matchStatController.addRedCard(idmatch, idplayer, idteam);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/lineup/:matchId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idteam, players } = req.body;

    const result = await matchStatController.lineupMaking(idmatch, idteam, players);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get('/lineup/:matchId/:teamId', async (req, res) => {
//   try {
//     const idmatch = req.params.matchId;
//     const idteam = req.params.teamId;

//     // Call the getLineupForTeam function to retrieve the lineup
//     const lineup = await matchStatController.getFormattedLineup(idmatch, idteam);

//     // Send the lineup as a response
//     res.status(200).json(lineup);
//   } catch (error) {
//     console.error('Error getting lineup:', error);
//     res.status(500).json({ message: error.message || 'Internal Server Error' });
//   }
// });
router.get('/lineup/:matchId/:teamId', async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const idteam = req.params.teamId;

    // Call the getFormattedLineup function to retrieve the lineup
    const lineup = await matchStatController.getFormattedLineup(idmatch, idteam);

    // Send the lineup as a response
    res.status(200).json(lineup);
  } catch (error) {
    console.error(`Error getting lineup for match ID ${req.params.matchId} and team ID ${req.params.teamId}:`, error);

    if (error.message.includes('Match stats not found')) {
      res.status(404).json({ message: 'Lineup not found' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});




module.exports = router;

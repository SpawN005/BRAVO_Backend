const express = require("express");
const router = express.Router();
const matchStatController = require("../../controllers/matchStat.controller");
const Match = require("../../models/matches");

router.get("/GeneralStats", async (req, res) => {
  try {
    const generalStats = await matchStatController.getGenerals();
    res.status(200).json(generalStats);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
// Route to handle match actions
router.post("/score/:matchId", async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer1, idplayer2, idteam } = req.body;

    const result = await matchStatController.scoreGoal(
      idmatch,
      idplayer1,
      idplayer2,
      idteam
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/assist/:matchId", async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer, idteam } = req.body;

    const result = await matchStatController.assistOnly(
      idmatch,
      idplayer,
      idteam
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// lhistorique mta3 les actions fil tableau fil wosst

router.post("/cancelGoal/:matchId", async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer1, idplayer2, idteam } = req.body;

    const result = await matchStatController.cancelGoal(
      idmatch,
      idplayer1,
      idplayer2,
      idteam
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/yellow-card/:matchId", async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer, idteam } = req.body;

    const result = await matchStatController.addYellowCard(
      idmatch,
      idplayer,
      idteam
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/red-card/:matchId", async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idplayer, idteam } = req.body;

    const result = await matchStatController.addRedCard(
      idmatch,
      idplayer,
      idteam
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get("/matches/:matchId/stat", async (req, res) => {
//   try {
//     const { matchId } = req.params;
//     const { teamId1, teamId2 } = req.body;
//     console.log(matchId, teamId1, teamId2)
//     const matchStats = await matchStatController.getMatchStatsByMatchId(
//       matchId,
//       teamId1,
//       teamId2
//     );
//     res.status(200).json(matchStats);
//   } catch (error) {
//     res
//       .status(error.status || 500)
//       .json({ message: error.message || "Internal Server Error" });
//   }
// });

router.post("/matches/:matchId/stat", async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchStats = await matchStatController.getMatchStatsByMatchIdPost(
      matchId
    );
    res.status(200).json(matchStats);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

router.post("/lineup/:matchId", async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const { idteam, players } = req.body;
    const result = await matchStatController.lineupMaking(
      idmatch,
      idteam,
      players
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:matchId/:teamId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const teamId = req.params.teamId;

    // Call the controller method to get the match by ID
    const match = await matchStatController.getMatchStats(matchId, teamId);

    res.status(200).json(match);
  } catch (error) {
    console.error("Error getting match by ID:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.get("/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;

    // Call the controller method to get the match by ID
    const match = await matchStatController.getMatchStats(matchId);

    res.status(200).json(match);
  } catch (error) {
    console.error("Error getting match by ID:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.post("/updateTeamWin/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    await matchStatController.updateTeamWin(match);

    res.status(200).json({ message: "Team wins updated successfully" });
  } catch (error) {
    console.error("Error updating team wins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/startMatch/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    await matchStatController.startMatch(matchId);

    res.status(200).json({ message: "Team wins updated successfully" });
  } catch (error) {
    console.error("Error updating team wins:", error);
    res.status(500).json({ message: "Internal server error" });
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
router.get("/lineup/:matchId/:teamId", async (req, res) => {
  try {
    const idmatch = req.params.matchId;
    const idteam = req.params.teamId;

    // Call the getFormattedLineup function to retrieve the lineup
    const lineup = await matchStatController.getFormattedLineup(
      idmatch,
      idteam
    );

    // Send the lineup as a response
    res.status(200).json(lineup);
  } catch (error) {
    console.error(
      `Error getting lineup for match ID ${req.params.matchId} and team ID ${req.params.teamId}:`,
      error
    );

    if (error.message.includes("Match stats not found")) {
      res.status(404).json({ message: "Lineup not found" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

module.exports = router;

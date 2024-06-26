const express = require("express");
const MatchController = require("../../controllers/match.controller");
const TournamentsController = require("../../controllers/TournamentController");
const tournament = require("../../models/tournament");
const Match = require("../../models/matches");
const router = express.Router();

router.get("/tournaments/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const tournament = await MatchController.getTournamentById(tournamentId);

    res.status(200).json(tournament);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});
router.get("/teams/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const teams = await MatchController.getAllTeamsInTournament(tournamentId);

    res.status(200).json(teams);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});
router.post("/knockout/:tournamentId", async (req, res) => {
  try {
    const { team1Id, team2Id, date, referee, observer } = req.body;
    const tournamentId = req.params.tournamentId;

    // Ensure that req.body is defined and contains the required properties
    if (!team1Id || !team2Id || !date) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const match = await MatchController.createKnockoutMatch(req, res); // Pass req and res to the controller

    res.status(201).json(match);
  } catch (error) {
    console.error("Error creating knockout match manually:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.post("/group-matches/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    const matches = await MatchController.createGroupMatches(tournamentId); // Pass tournamentId to the controller
    console.log(matches);
    res.status(201).json(matches);
  } catch (error) {
    console.error("Error creating group matches:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

router.get("/matches/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    // Call the controller method to get all matches for the specified tournament ID
    const matches = await MatchController.getAllMatchesForTournament(
      tournamentId
    );

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.get("/team/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;

    // Call the controller method to get all matches for the specified tournament ID
    const matches = await MatchController.getMatch(matchId);

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.get("/myteam/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // Call the controller method to get all matches for the specified tournament ID
    const matches = await MatchController.getMatchesByTeamId(teamId);

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.get("/upcomingteams/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // Call the controller method to get all matches for the specified tournament ID
    const matches = await MatchController.UpcomingMatches(teamId);

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

router.get("/bracket/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    // Call the controller method to get all matches for the specified tournament ID
    const matches = await MatchController.getBracketForTournament(tournamentId);

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.get("/goupknockout/gettopteams/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const Tournament = await tournament.findById(tournamentId);
    const topTeamsPerGroup = MatchController.determineTopTeams(
      Tournament._id,
      Tournament.groups,
      Tournament.standings,
      2
    );

    if (Tournament.rules.type === "LEAGUE") {
      Tournament.tournamentWinner =
        topTeamsPerGroup[Tournament.groups[0]._id.toString()][0];
      Tournament.save();
    } else {
      const existingMatches = await Match.find({
        tournament: tournamentId,
        stage: "KNOCKOUT_STAGE",
        round: 1,
      }).sort({ _id: 1 });
      const groupIds = Object.keys(topTeamsPerGroup);
      const numGroups = groupIds.length;

      // Pair top teams with second teams from other groups
      for (let i = 0; i < numGroups; i++) {
        const topTeams = topTeamsPerGroup[groupIds[i]];
        const secondTeams = topTeamsPerGroup[groupIds[(i + 1) % numGroups]];

        // Update matches with the top team and second team pairing
        // Assume matches are pre-created in the database and are ordered as expected
        if (existingMatches[i]) {
          existingMatches[i].team1 = topTeams[0];
          existingMatches[i].team2 = secondTeams[1];
          await existingMatches[i].save();
          console.log(existingMatches[i]);
        }
      }
    }
    res.status(200).json(topTeamsPerGroup);
  } catch (error) {
    console.error("Error fetching top teams:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.get("/livematches", async (req, res) => {
  try {
    const liveMatches = await MatchController.getAllLiveMatches();
    res.status(200).json(liveMatches);
  } catch (error) {
    console.error("Error retrieving live matches:", error);
    res.status(500).json({ error: "Error retrieving live matches." });
  }
});
router.get("/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;

    const match = await MatchController.getMatchById(matchId);

    res.status(200).json(match);
  } catch (error) {
    console.error("Error getting match by ID:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

router.patch("update-date/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const newDate = req.body.date; // Assuming the new date is provided in the request body

    // Call the controller method to update the date of the match by ID
    const updatedMatch = await MatchController.updateMatchDateById(
      matchId,
      newDate
    );

    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error("Error updating match date by ID:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.patch("finish/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const winningTeamId = req.body.winningTeamId;

    // Call the controller method to update the date of the match by ID
    const updatedMatch = await MatchController.updateMatchDateById(matchId, {
      isWinner: winningTeamId,
    });

    if (updatedMatch.nextMatch) {
      // Retrieve the details of the next match
      const nextMatch = await MatchController.getMatchById(
        updatedMatch.nextMatch
      );

      // Update the team information of the next match based on the winning team
      if (nextMatch) {
        const teamField =
          updatedMatch.team1 === winningTeamId ? "team1" : "team2";
        const updatedNextMatch = await MatchController.updateNextMatchTeam(
          nextMatch._id,
          teamField,
          winningTeamId
        );

        console.log("Next match updated:", updatedNextMatch);
      }
    }

    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error("Error finishing match:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

router.patch("/patch/:id", async (req, res) => {
  try {
    const updatedMatch = await MatchController.patchTMatchById(
      req.params.id,
      req.body
    );

    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error("Error updating match date by ID:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.post("/update-score", async (req, res) => {
  try {
    // Add logic to update the score
    const updatedScore = await MatchController.updatedScore(req.body);

    // Emit an event to notify clients about the updated score
    io.emit("scoreUpdated", { updatedScore });

    // Respond with the updated score
    res.status(200).json({ updatedScore });
  } catch (error) {
    console.error("Error updating score:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const matches = await MatchController.getMatchesByUserId(userId);

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches for user:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const liveMatches = await MatchController.getLiveMatches();
    res.status(200).json(liveMatches);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des matchs en direct :",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des matchs en direct." });
  }
});
router.get("/matchess/:teamId", async (req, res) => {
  const teamId = req.params.teamId;

  try {
    const liveMatches = await MatchController.getMatchestatByTeamId(teamId);
    res.json(liveMatches);
  } catch (error) {
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération des matches.",
    });
  }
});
module.exports = router;

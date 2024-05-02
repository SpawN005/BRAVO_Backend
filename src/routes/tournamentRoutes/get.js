var TournamentsController = require("../../controllers/TournamentController");

const initializeGetRoutes = (app) => {

  // GET tournament by ID
  app.get("/tournaments/:id", TournamentsController.getById);
  app.get("/tournaments/user/:id", TournamentsController.getByIdOwner);
  app.get(
    "/tournament/standings/:tournamentId",
    TournamentsController.getStandings
  );
  app.get(
    "/tournaments/status/:status",
    TournamentsController.getTournamentsByStatus
  );

};

module.exports = initializeGetRoutes;

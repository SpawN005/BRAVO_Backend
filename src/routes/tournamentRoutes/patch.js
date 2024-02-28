var TournamentsController = require("../../controllers/TournamentController");

const initializePatchRoutes = (app) => {
  
  app.patch("/tournaments/patch/:id", [
    TournamentsController.patchTById
  ]);
};

module.exports = initializePatchRoutes;

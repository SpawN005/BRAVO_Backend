var TournamentsController = require("../../controllers/TournamentController");

const initializeDeleteRoutes = (app) => {

  app.delete("/tournaments/delete/:id", 
    TournamentsController.removeById,
  );
};

module.exports = initializeDeleteRoutes;
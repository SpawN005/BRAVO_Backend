var TournamentsController = require("../../controllers/TournamentController");

const initializeGetRoutes = (app) => {

    // GET all tournaments
    app.get("/tournaments", TournamentsController.getAll);

    // GET tournament by ID
    app.get("/tournaments/:id", TournamentsController.getById);
};

module.exports = initializeGetRoutes;

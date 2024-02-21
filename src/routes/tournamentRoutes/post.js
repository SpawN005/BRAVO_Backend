var TournamentsController = require("../../controllers/TournamentController");
var ValidationMiddleware = require("../../middlewares/validation/validation.middleware");

const initializePostRoutes = (app) => {

  /**
   * @swagger
   * /tournaments/create:
   *   post:
   *     tags:
   *       - tournaments
   *     description: Creates a new tournament
   *     produces:
   *       - application/json
   *     requestBody:
   *        content:
   *         'application/json':
   *           schema:
   *            $ref: '#/components/schemas/Tournament'
   *     responses:
   *       201:
   *         description: Tournament created
   *       400:
   *         description: Bad request
   */
  app.post("/tournaments/create", [
//    ValidationMiddleware.validateTournamentInput, // Assuming you have this middleware
    TournamentsController.insert,
  ]);

};

module.exports = initializePostRoutes;

var UsersController = require("../../controllers/users.controller");
var PermissionMiddleware = require("../../middlewares/permissions/permissions.middleware");
var ValidationMiddleware = require("../../middlewares/validation/validation.middleware");

const initializeGetRoutes = (app) => {
  /**
   * @swagger
   * /users/{userId}:
   *    get:
   *     tags:
   *       - users
   *     description: This should return the user with the given id.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: user id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           'application/json':
   *               schema:
   *                 $ref: '#/components/schemas/User'
   *           'application/xml':
   *               schema:
   *                 $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */
  app.get("/users/:userId", [UsersController.getById]);
  app.get("/users/tournaments/:userId", [UsersController.getTournaments]);
  app.get("/stats/:userId", [UsersController.getStats]);

  /**
   * @swagger
   * /users:
   *    get:
   *     tags:
   *     - users
   *     description: This should return all users
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: limit
   *         description: users limit per page, 10 by default
   *         in: query
   *         schema:
   *           type: Integer
   *       - name: page
   *         description: page number, 0 by default
   *         in: query
   *         schema:
   *           type: Integer
   *     responses:
   *       200:
   *         description: Users fetched
   *       400:
   *         description: Bad request
   */
  app.get("/users", [
    ValidationMiddleware.validJWTNeeded,
    UsersController.list,
  ]);

  app.get("/observers/:tournamentId", [
    UsersController.getObserversByTournamentId,
  ]);
  app.get("/observers", [UsersController.getObservers]);
  app.get("/availableobservers/:date", [UsersController.getAvailableObservers]);
  app.get("/referees/:tournamentId", [
    UsersController.getRefereesByTournamentId,
  ]);
  app.get("/referees", [UsersController.getReferees]);
  app.get("/availablereferees/:date", [UsersController.getAvailableReferees]);
};

module.exports = initializeGetRoutes;

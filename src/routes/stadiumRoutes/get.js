const StadiumsController = require("../../controllers/stadiums.controller");
const ValidationMiddleware = require("../../middlewares/validation/validation.middleware");

const initializeGetRoutes = (app) => {
  /**
   * @swagger
   * /stadiums/{stadiumId}:
   *    get:
   *     tags:
   *       - stadiums
   *     description: Get a stadium by ID
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: stadiumId
   *         description: stadium id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Stadium found
   *         content:
   *           'application/json':
   *               schema:
   *                 $ref: '#/components/schemas/Stadium'
   *       404:
   *         description: Stadium not found
   */
  app.get("/stadiums/:stadiumId", [StadiumsController.getStadiumById]);

  /**
   * @swagger
   * /stadiums:
   *    get:
   *     tags:
   *     - stadiums
   *     description: Get all stadiums
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: limit
   *         description: stadiums limit per page, 10 by default
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
   *         description: Stadiums fetched
   *       400:
   *         description: Bad request
   */
  app.get("/stadium/available/:date", [
    StadiumsController.getAvailableStadiums,
  ]);
  app.get("/stadiums", [
    ValidationMiddleware.validJWTNeeded,
    StadiumsController.getAllStadiums,
  ]);
};

module.exports = initializeGetRoutes;

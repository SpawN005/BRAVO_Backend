const StadiumsController = require("../../controllers/stadiums.controller");
const ValidationMiddleware = require("../../middlewares/validation/validation.middleware");

const initializePostRoutes = (app) => {
  /**
   * @swagger
   * /stadiums/create:
   *   post:
   *     tags:
   *       - stadiums
   *     description: Creates a new stadium
   *     produces:
   *       - application/json
   *     requestBody:
   *        content:
   *         'application/json':
   *           schema:
   *            $ref: '#/components/schemas/Stadium'
   *     responses:
   *       201:
   *         description: Stadium created
   *       400:
   *         description: Bad request
   */

  app.post("/stadiums/create", [
    ValidationMiddleware.validateStadiumInput,
    StadiumsController.createStadium,
  ]);

  // Add more routes as needed for stadium authentication or other operations
};

module.exports = initializePostRoutes;

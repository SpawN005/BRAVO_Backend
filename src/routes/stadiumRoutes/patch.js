const StadiumsController = require("../../controllers/stadiums.controller");
const ValidationMiddleware = require("../../middlewares/validation/validation.middleware");


const initializePatchRoutes = (app) => {
  /**
   * @swagger
   * /stadiums/{stadiumId}:
   *    patch:
   *     tags:
   *     - stadiums
   *     description: Update a stadium by ID
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: stadiumId
   *         description: stadium id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *        content:
   *         'application/json':
   *           schema:
   *             $ref: '#/components/schemas/Stadium'
   *     responses:
   *       200:
   *         description: Stadium updated
   *       404:
   *         description: Stadium not found
   */
  app.patch("/stadiums/:stadiumId", [
    StadiumsController.updateStadiumById,
  ]);
};

module.exports = initializePatchRoutes;

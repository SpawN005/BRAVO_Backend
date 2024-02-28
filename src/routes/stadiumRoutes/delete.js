const StadiumsController = require("../../controllers/stadiums.controller");
const PermissionMiddleware = require("../../middlewares/permissions/permissions.middleware");
const ValidationMiddleware = require("../../middlewares/validation/validation.middleware");

const initializeDeleteRoutes = (app) => {
  /**
   * @swagger
   * /stadiums/{stadiumId}:
   *    delete:
   *     tags:
   *     - stadiums
   *     description: Delete a stadium by ID
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
   *         description: Stadium deleted
   *       404:
   *         description: Stadium not found
   */
  app.delete("/stadiums/:stadiumId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(3), // Adjust the permission level as needed
    StadiumsController.deleteStadiumById,
  ]);
};

module.exports = initializeDeleteRoutes;

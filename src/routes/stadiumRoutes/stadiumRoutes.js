const express = require("express");
const router = express.Router();
const stadiumController = require("../../controllers/stadiums.controller");


// Get all stadiums
router.get("/", stadiumController.getAllStadiums);

// Get a single stadium by ID
router.get("/:id", stadiumController.getStadiumById);

// Create a new stadium
router.post("/", stadiumController.createStadium);

// Update a stadium by ID
router.put("/:id", stadiumController.updateStadiumById);

// Delete a stadium by ID
router.delete("/:id", stadiumController.deleteStadiumById);

module.exports = router;

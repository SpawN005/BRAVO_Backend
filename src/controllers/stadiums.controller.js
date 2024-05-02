const Stadium = require("../models/stadium");
var MatchModel=require("../models/matches")

// Get all stadiums
const getAllStadiums = async (req, res) => {
  try {
    const stadiums = await Stadium.find();
    res.json(stadiums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getAvailableStadiums = async (req, res) => {
  try {
    const stadiums = await Stadium.find();
    let matches = [];
    if (req.params.date) {
      matches = await MatchModel.findByDate(req.params.date);
    }
    
    let assignedStadiumIds = [];
    if (matches && matches.length > 0) {
      assignedStadiumIds = matches.map(match => match.stadium);
    }
    
    let availableStadiums = [];
    if (assignedStadiumIds && assignedStadiumIds.length === 0) {
      availableStadiums = stadiums;
    } else if (assignedStadiumIds.length < stadiums.length) {
      availableStadiums = stadiums.filter(stadium => {
        return !assignedStadiumIds.find(id => id.equals(stadium._id));
      });
    }
    
    res.status(200).send({
      code: 200,
      status: "success",
      data: availableStadiums,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a single stadium by ID
const getStadiumById = async (req, res) => {
  const { id } = req.params;
  try {
    const stadium = await Stadium.findById(id);
    if (!stadium) {
      return res.status(404).json({ error: "Stadium not found" });
    }
    res.json(stadium);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new stadium
const createStadium = async (req, res) => {
  const { name, location, capacity, address,isAvailable } = req.body;

  const newStadium = new Stadium({
    name,
    location,
    address,
    capacity,
    isAvailable,
  });

  try {
    const savedStadium = await newStadium.save();
    res.status(201).json(savedStadium);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a stadium by ID
const updateStadiumById = async (req, res) => {
  const { id } = req.params;
  const { name, location, capacity,address, isAvailable } = req.body;

  try {
    const updatedStadium = await Stadium.findByIdAndUpdate(
      id,
      {
        name,
        location,
        capacity,
        address,
        isAvailable,
      },
      { new: true }
    );

    if (!updatedStadium) {
      return res.status(404).json({ error: "Stadium not found" });
    }

    res.json(updatedStadium);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a stadium by ID
const deleteStadiumById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStadium = await Stadium.findByIdAndDelete(id);

    if (!deletedStadium) {
      return res.status(404).json({ error: "Stadium not found" });
    }

    res.json({ message: "Stadium deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllStadiums,
  getAvailableStadiums,
  getStadiumById,
  createStadium,
  updateStadiumById,
  deleteStadiumById,
};

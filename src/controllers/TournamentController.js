var express = require('express');
var router = express.Router();
var Tournament = require('../models/tournament'); // Replace with the correct path to your model

// POST route to create a new tournament
router.post('/create', async (req, res) => {
    try {
        const { name, startDate, endDate, location, rules, groups, sponsors, matches } = req.body;

        // Validate the input
        if (isEmpty(name) || !rules || !rules.type || type.indexOf(rules.type) === -1) {
            return res.status(400).send('Invalid input');
        }

        // Create a new tournament instance
        const newTournament = new Tournament({
            name,
            startDate,
            endDate,
            location,
            rules,
            groups,
            sponsors,
            matches
        });

        // Save the tournament to the database
        const savedTournament = await newTournament.save();
        res.status(201).send(savedTournament);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;

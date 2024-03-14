const stadium = require('../models/stadium')


exports.createPlayer = async (req, res) => {
    try {
        const s = new stadium(req.body);
       
        await s.save();
        res.status(201).send(player);
    } catch (error) {
        res.status(400).send(error);
    }
};
const express = require('express')
const PlayerController = require('../../controllers/playerController')
const router = express.Router();
const upload =require ('../../middlewares/upload')
const validate = require('../../middlewares/validation/validators');  

router.get('/', PlayerController.getAllPlayers);
router.get('/:id', PlayerController.getPlayerById);
router.post('/', upload.single('logo'),PlayerController.createPlayer);
router.delete('/:id', PlayerController.destroy);
router.put('/:id', PlayerController.updatePlayerById);
router.post('/assign/:teamId', PlayerController.assignPlayerToTeam);

module.exports = router
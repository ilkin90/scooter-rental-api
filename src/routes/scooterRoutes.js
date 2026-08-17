const express = require('express');
const router = express.Router();

const {
    getAllScooters,
    getScootersById,
    createScooters,
    updateScooters,
    deleteScooters
} = require('../controllers/scooterController');

router.get('/',getAllScooters );
router.get('/:id', getScootersById);
router.post('/', createScooters);
router.patch('/:id', updateScooters);
router.delete('/:id',deleteScooters);

module.exports = router
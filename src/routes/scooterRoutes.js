const express = require('express');
const router = express.Router();
const {
    authenticateToken, 
    requireAdmin} = require('../middleware/authMiddleware')

const {
    getAllScooters,
    getNearbyScooters,
    getScootersById,
    createScooters,
    updateScooters,
    deleteScooters
} = require('../controllers/scooterController');

router.get('/',getAllScooters );
router.get('/nearby', getNearbyScooters)
router.get('/:id', getScootersById);
router.post('/', authenticateToken, requireAdmin, createScooters);
router.patch('/:id', authenticateToken, requireAdmin, updateScooters);
router.delete('/:id',authenticateToken, requireAdmin, deleteScooters);


module.exports = router;
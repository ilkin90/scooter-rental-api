const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const {
    startRental,
    finishRental
} = require('../controllers/rentalController');

router.post('/start', authenticateToken, startRental);
router.post('/finish', authenticateToken, finishRental);

module.exports = router;
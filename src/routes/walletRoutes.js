const express = require('express');
const router = express.Router();
const {
    topUp,
    getWallet
} = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/authMiddleware')

router.post('/topup', authenticateToken, topUp);
router.get('/', authenticateToken,getWallet);

module.exports = router;
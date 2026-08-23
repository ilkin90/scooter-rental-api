const express = require('express');
const router = express.Router();
const {
    topUp,
    getWallet
} = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { topUpValidation } = require('../middleware/walletValidation');
const validate = require('../middleware/validate');

/**
 * @swagger
 * components:
 *   schemas:
 *     WalletTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         wallet_id:
 *           type: integer
 *           example: 5
 *         amount:
 *           type: number
 *           format: float
 *           example: 10.00
 *         transaction_type:
 *           type: string
 *           enum: [TOP_UP, PAYMENT]
 *           example: "TOP_UP"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-08-23T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Daxil olmuş istifadəçinin cüzdan məlumatlarını gətirir
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hesab uğurla tapıldı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "hesab ugurla tapildi"
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: İstifadəçiyə uygun hesab tapılmadı
 *       401:
 *         description: Avtorizasiya xətası (Token yoxdur və ya keçərsizdir)
 */
router.get('/', authenticateToken, getWallet);

/**
 * @swagger
 * /api/wallet/topup:
 *   post:
 *     summary: Cüzdan balansını artırır
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 minimum: 1.00
 *                 example: 10.00
 *                 description: Artırılacaq məbləğ (Minimum 1.00 AZN)
 *     responses:
 *       200:
 *         description: Balans uğurla artırıldı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "balans ugurla artirildi"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *                     transaction:
 *                       $ref: '#/components/schemas/WalletTransaction'
 *       400:
 *         description: Daxil edilən məbləğ yanlışdır (1-dən kiçikdir və ya ədəd deyil) və ya cüzdan tapılmadı
 *       401:
 *         description: Avtorizasiya xətası (Token yoxdur və ya keçərsizdir)
 */
router.post('/topup', authenticateToken, topUpValidation, validate, topUp);

module.exports = router;
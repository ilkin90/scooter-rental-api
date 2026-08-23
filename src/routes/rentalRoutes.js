const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const { startRentalValidation } = require('../middleware/rentalValidation');
const { authenticateToken } = require('../middleware/authMiddleware');

const {
    startRental,
    finishRental
} = require('../controllers/rentalController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Rental:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 5
 *         scooter_id:
 *           type: integer
 *           example: 2
 *         start_time:
 *           type: string
 *           format: date-time
 *           example: "2026-08-23T10:00:00.000Z"
 *         end_time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-08-23T10:30:00.000Z"
 *         total_minutes:
 *           type: integer
 *           example: 30
 *         total_cost:
 *           type: number
 *           format: float
 *           example: 3.90
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled]
 *           example: "active"
 */

/**
 * @swagger
 * /api/rentals/start:
 *   post:
 *     summary: Yeni skuter icarəsini başladır
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scooterId
 *             properties:
 *               scooterId:
 *                 type: integer
 *                 example: 2
 *                 description: İcarəyə götürüləcək skuterin ID-si
 *     responses:
 *       201:
 *         description: İcarə uğurla başladıldı
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
 *                   example: "İcarə uğurla başladıldı"
 *                 data:
 *                   type: object
 *                   properties:
 *                     scooter:
 *                       $ref: '#/components/schemas/Scooter'
 *                     rental:
 *                       $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Çatışmayan məlumat, skuter məşğuldur, istifadəçinin artıq aktiv icarəsi var və ya balans yetərsizdir (Minimum 0.13 AZN)
 *       401:
 *         description: Avtorizasiya xətası (Token yoxdur və ya keçərsizdir)
 *       404:
 *         description: İstifadəçiyə aid cüzdan tapılmadı
 */
router.post('/start', authenticateToken, startRentalValidation, validate, startRental);

/**
 * @swagger
 * /api/rentals/finish:
 *   post:
 *     summary: Aktiv skuter icarəsini yekunlaşdırır və ödənişi hesablayır
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: İcarə uğurla tamamlandı
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
 *                   example: "İcarə uğurla tamamlandı"
 *                 data:
 *                   type: object
 *                   properties:
 *                     durationMinutes:
 *                       type: integer
 *                       example: 15
 *                       description: Ümumi istifadə olunan dəqiqə
 *                     totalPrice:
 *                       type: number
 *                       format: float
 *                       example: 1.95
 *                       description: Yekun xidmət haqqı (AZN)
 *                     remainingBalance:
 *                       type: number
 *                       format: float
 *                       example: 8.05
 *                       description: Cüzdanda qalan balans
 *                     rental:
 *                       $ref: '#/components/schemas/Rental'
 *                     scooter:
 *                       $ref: '#/components/schemas/Scooter'
 *       400:
 *         description: İstifadəçinin aktiv icarədə olan skuteri tapılmadı
 *       401:
 *         description: Avtorizasiya xətası (Token yoxdur və ya keçərsizdir)
 */
router.post('/finish', authenticateToken, finishRental);

module.exports = router;
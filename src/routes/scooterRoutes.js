const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const {
    getAllScootersValidation,
    getNearbyScootersValidation,
    getScooterByIdValidation,
    createScooterValidation,
    updateScooterValidation,
    deleteScooterValidation
} = require('../middleware/scooterValidation');

const {
    authenticateToken, 
    requireAdmin
} = require('../middleware/authMiddleware');

const {
    getAllScooters,
    getNearbyScooters,
    getScootersById,
    createScooters,
    updateScooters,
    deleteScooters
} = require('../controllers/scooterController');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Scooter:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         code:
 *           type: string
 *           example: "SC-101"
 *         battery_level:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 85
 *         status:
 *           type: string
 *           enum: [available, in_use, maintenance]
 *           example: "available"
 *         latitude:
 *           type: number
 *           format: float
 *           example: 40.4093
 *         longitude:
 *           type: number
 *           format: float
 *           example: 49.8671
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-08-23T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/scooters:
 *   get:
 *     summary: "Butun aktiv skuterleri getirir"
 *     tags: [Scooters]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, in_use, maintenance]
 *         description: "Skuterin statusu"
 *       - in: query
 *         name: battery_level
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 80
 *         description: "Minimum batareya seviyyesi (0-100 arasi)"
 *     responses:
 *       200:
 *         description: "Ugurlu emeliyyat"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scooter'
 */
router.get('/', getAllScootersValidation, validate, getAllScooters);

/**
 * @swagger
 * /api/scooters/nearby:
 *   get:
 *     summary: "Daxil edilen koordinatlara esasen yaxinliqdaki skuterleri getirir"
 *     tags: [Scooters]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: "Istifadecinin enliyi (Latitude)"
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: "Istifadecinin uzunlugu (Longitude)"
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 1
 *         description: "Axtaris radiusu (km ile, susmaya gore 1)"
 *     responses:
 *       200:
 *         description: "Yaxinliqdaki skuterlerin siyahisi"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scooter'
 *       400:
 *         description: "Koordinatlar daxil edilmeyib ve ya eded formatinda deyil"
 */
router.get('/nearby', getNearbyScootersValidation, validate, getNearbyScooters);

/**
 * @swagger
 * /api/scooters/{id}:
 *   get:
 *     summary: "ID-ye gore tek bir skuteri getirir"
 *     tags: [Scooters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Skuterin ID-si"
 *     responses:
 *       200:
 *         description: "Skuter tapildi"
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
 *                   example: "netice ugurludur"
 *                 data:
 *                   $ref: '#/components/schemas/Scooter'
 *       404:
 *         description: "Gosterilen ID ile skuter tapilmadi"
 */
router.get('/:id', getScooterByIdValidation, validate, getScootersById);

/**
 * @swagger
 * /api/scooters:
 *   post:
 *     summary: "Yeni skuter elave edir (Yalniz Admin)"
 *     tags: [Scooters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - battery_level
 *             properties:
 *               code:
 *                 type: string
 *                 example: "SC-102"
 *               battery_level:
 *                 type: integer
 *                 example: 90
 *               status:
 *                 type: string
 *                 enum: [available, in_use, maintenance]
 *                 default: "available"
 *                 example: "available"
 *               latitude:
 *                 type: number
 *                 example: 40.4093
 *               longitude:
 *                 type: number
 *                 example: 49.8671
 *     responses:
 *       201:
 *         description: "Skuter ugurla yaradildi"
 *       400:
 *         description: "Mentiqle bagli xeta ve ya catismayan melumat"
 *       401:
 *         description: "Avtorizasiya xetasi (Token yoxdur)"
 *       403:
 *         description: "Icaze xetasi (Admin deyilsiniz)"
 */
router.post('/', authenticateToken, requireAdmin, createScooterValidation, validate, createScooters);

/**
 * @swagger
 * /api/scooters/{id}:
 *   patch:
 *     summary: "Skuter melumatlarini yenileyir (Yalniz Admin)"
 *     tags: [Scooters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Skuterin ID-si"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, in_use, maintenance]
 *                 example: "maintenance"
 *               battery_level:
 *                 type: integer
 *                 example: 45
 *               latitude:
 *                 type: number
 *                 example: 40.4100
 *               longitude:
 *                 type: number
 *                 example: 49.8680
 *     responses:
 *       200:
 *         description: "Melumatlar ugurla deyisdirildi"
 *       400:
 *         description: "Hec bir parametr daxil edilmeyib"
 *       404:
 *         description: "ID-ye uygun skuter tapilmadi"
 */
router.patch('/:id', authenticateToken, requireAdmin, updateScooterValidation, validate, updateScooters);

/**
 * @swagger
 * /api/scooters/{id}:
 *   delete:
 *     summary: "Skuteri soft-delete edir (Yalniz Admin)"
 *     tags: [Scooters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Skuterin ID-si"
 *     responses:
 *       200:
 *         description: "Soft delete ugurla heyata kecirildi"
 *       404:
 *         description: "Sehv ID daxil edilib"
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteScooterValidation, validate, deleteScooters);

module.exports = router;
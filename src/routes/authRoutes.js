const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const {
    registerValidation,
    loginValidation
} = require('../middleware/authValidation');

const {
    registerUser,
    loginUser
} = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           example: "user"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-08-23T10:00:00.000Z"
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         balance:
 *           type: number
 *           format: float
 *           example: 0.00
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-08-23T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni istifadəçi qeydiyyatı (Avtomatik olaraq cüzdan da yaradılır)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Yeni hesab və cüzdan uğurla yaradıldı
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
 *                   example: "yeni hesab elave edildi"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Email və ya şifrə daxil edilməyib
 *       409:
 *         description: Bu email ilə artıq qeydiyyatdan keçilib
 */
router.post('/register', registerValidation, validate, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: İstifadəçi giriş edir və JWT Token əldə edir
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Giriş uğurla tamamlandı
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
 *                   example: "giris ugurla tamamlandi"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "user"
 *       400:
 *         description: Email və ya şifrə daxil edilməyib
 *       401:
 *         description: Email və ya şifrə yanlışdır
 */
router.post('/login',loginValidation, validate, loginUser);

module.exports = router;
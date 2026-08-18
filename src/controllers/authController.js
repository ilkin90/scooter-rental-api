const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'daxil etdiyiniz melumatlar tam deyil'
            });
        }

        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'bu email bagli hesab var'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const values = [email, hashedPassword];
        const result = await db.query(
            'INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING id, email, role, created_at',
            values
        );

        res.status(201).json({
            success: true,
            message: 'yeni istifadeci daxil edildi',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'email ve sifre daxil edilmelidir'
            });
        }

        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'email ve ya sifre yanlisdir'
            });
        }

        const user = existingUser.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'email ve ya sifre yanlisdir'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'giris ugurla tamamlandi',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser
};
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'email ve paswordu daxil edin'
        });
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'bu emaile bagli hesab var'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await client.query(
            'INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING id, email, role, created_at',
            [email, hashedPassword]
        );
        const user = userResult.rows[0];

        const walletResult = await client.query(
            'INSERT INTO wallets(user_id) VALUES($1) RETURNING *',
            [user.id]
        );
        const wallet = walletResult.rows[0];

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'yeni hesab elave edildi',
            data: {
                user: user,
                wallet: wallet
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
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
const db = require('../config/db');

const startRental = async (req, res, next) => {
    const { scooterId } = req.body;
    const userId = req.user.id;

    if (!scooterId) {
        return res.status(400).json({
            success: false,
            message: 'Skuter ID-si daxil edilməlidir'
        });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const checkScooter = await client.query(
            'SELECT status FROM scooters WHERE id = $1 AND status = $2 FOR UPDATE',
            [scooterId, 'available']
        );

        if (checkScooter.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Axtardığınız skuter tapılmadı və ya hazırda istifadədədir'
            });
        }

        const activeScooter = await client.query(
            'SELECT status FROM rentals WHERE user_id = $1 AND status = $2 FOR UPDATE',
            [userId, 'active']
        );

        if (activeScooter.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Sizin hal-hazırda aktiv bir icarəniz var'
            });
        }

        const userWallet = await client.query(
            'SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE',
            [userId]
        );

        if (userWallet.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'İstifadəçiyə aid cüzdan tapılmadı'
            });
        }

        const currentBalance = parseFloat(userWallet.rows[0].balance);
        if (currentBalance < 0.13) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Balansınızda kifayət qədər vəsait yoxdur. Minimum 0.13 AZN olmalıdır'
            });
        }

        const updateScooter = await client.query(
            'UPDATE scooters SET status = $1 WHERE id = $2 RETURNING *',
            ['in_use', scooterId]
        );

        const updateRental = await client.query(
            'INSERT INTO rentals(user_id, scooter_id, start_time, total_minutes, total_cost, status) VALUES ($1, $2, NOW(), 0, 0.00, $3) RETURNING *',
            [userId, scooterId, 'active']
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'İcarə uğurla başladıldı',
            data: {
                scooter: updateScooter.rows[0],
                rental: updateRental.rows[0]
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

const finishRental = async (req, res, next) => {
    const userId = req.user.id;
    const PER_MINUTE_PRICE = 0.13;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const activeRental = await client.query(
            `SELECT r.id, r.scooter_id, r.start_time, r.total_minutes, r.total_cost, w.id as wallet_id, w.balance
             FROM rentals r
             JOIN wallets w ON r.user_id = w.user_id
             WHERE r.user_id = $1 AND r.status = $2 
             FOR UPDATE OF r, w`,
            [userId, 'active']
        );

        if (activeRental.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'İcarədə olan skuter tapılmadı'
            });
        }

        const rental = activeRental.rows[0];
        const rentalId = rental.id;
        const scooterId = rental.scooter_id;
        const walletId = rental.wallet_id;
        const paidMinutes = parseInt(rental.total_minutes || 0, 10);
        let currentBalance = parseFloat(rental.balance);

        const calcQuery = await client.query(
            `SELECT GREATEST(1, CEIL(EXTRACT(EPOCH FROM (NOW() - $1::timestamptz)) / 60)) AS total_elapsed_minutes`,
            [rental.start_time]
        );

        const totalElapsedMinutes = parseInt(calcQuery.rows[0].total_elapsed_minutes, 10);
        
        const unpaidMinutes = totalElapsedMinutes - paidMinutes;
        let finalCost = parseFloat(rental.total_cost || 0);

        if (unpaidMinutes > 0) {
            const extraCharge = parseFloat((unpaidMinutes * PER_MINUTE_PRICE).toFixed(2));
            const actualCharge = Math.min(currentBalance, extraCharge);

            if (actualCharge > 0) {
                const updateWallet = await client.query(
                    `UPDATE wallets SET balance = balance - $1 WHERE id = $2 RETURNING balance`,
                    [actualCharge, walletId]
                );
                currentBalance = parseFloat(updateWallet.rows[0].balance);

                await client.query(
                    `INSERT INTO wallet_transactions (wallet_id, amount, transaction_type)
                     VALUES ($1, $2, $3)`,
                    [walletId, actualCharge, 'PAYMENT']
                );
            }
            finalCost += extraCharge;
        }

        const updateRental = await client.query(
            `UPDATE rentals 
             SET end_time = NOW(), total_minutes = $1, total_cost = $2, status = $3 
             WHERE id = $4 
             RETURNING *`,
            [totalElapsedMinutes, finalCost, 'completed', rentalId]
        );

        const updateScooter = await client.query(
            `UPDATE scooters 
             SET status = $1 
             WHERE id = $2 
             RETURNING *`,
            ['available', scooterId]
        );

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'İcarə uğurla tamamlandı',
            data: {
                durationMinutes: totalElapsedMinutes,
                totalPrice: finalCost,
                remainingBalance: currentBalance,
                rental: updateRental.rows[0],
                scooter: updateScooter.rows[0]
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    startRental,
    finishRental
};
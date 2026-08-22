const cron = require('node-cron');
const db = require('../config/db');

const startRentalCron = () => {
    cron.schedule('* * * * *', async () => {
        const client = await db.connect();

        try {
            const checkActive = await client.query(
                `SELECT id FROM rentals WHERE status = $1 LIMIT 1`,
                ['active']
            );

            if (checkActive.rows.length === 0) {
                return;
            }

            await client.query('BEGIN');

            const activeRentals = await client.query(
                `SELECT 
                    r.id AS rental_id, 
                    r.user_id, 
                    r.scooter_id, 
                    r.total_minutes,
                    r.total_cost,
                    w.id AS wallet_id,
                    w.balance 
                 FROM rentals r
                 JOIN wallets w ON r.user_id = w.user_id
                 WHERE r.status = $1 
                 FOR UPDATE OF r, w`,
                ['active']
            );

            const PER_MINUTE_FEE = 0.13;

            for (const rental of activeRentals.rows) {
                const { rental_id, user_id, scooter_id, wallet_id, balance, total_minutes, total_cost } = rental;
                const currentBalance = parseFloat(balance);
                const currentMinutes = parseInt(total_minutes || 0, 10);
                const currentCost = parseFloat(total_cost || 0.00);

                if (currentBalance >= PER_MINUTE_FEE) {
                    await client.query(
                        `UPDATE wallets SET balance = balance - $1 WHERE id = $2`,
                        [PER_MINUTE_FEE, wallet_id]
                    );

                    await client.query(
                        `INSERT INTO wallet_transactions (wallet_id, amount, transaction_type)
                         VALUES ($1, $2, $3)`,
                        [wallet_id, PER_MINUTE_FEE, 'PAYMENT']
                    );

                    await client.query(
                        `UPDATE rentals 
                         SET total_minutes = $1, total_cost = $2 
                         WHERE id = $3`,
                        [currentMinutes + 1, (currentCost + PER_MINUTE_FEE).toFixed(2), rental_id]
                    );

                } else {
                    await client.query(
                        `UPDATE rentals 
                         SET status = $1, end_time = NOW() 
                         WHERE id = $2`,
                        ['completed', rental_id]
                    );

                    await client.query(
                        `UPDATE scooters SET status = $1 WHERE id = $2`,
                        ['available', scooter_id]
                    );
                }
            }

            await client.query('COMMIT');

        } catch (error) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
            }
            console.error(error.message);
        } finally {
            client.release();
        }
    });
};

module.exports = startRentalCron;
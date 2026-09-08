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
            'SELECT id, status, battery_level FROM scooters WHERE id = $1 AND status = $2 FOR UPDATE',
            [scooterId, 'available']
        );

        if (checkScooter.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Axtardığınız skuter tapılmadı və ya hazırda istifadədədir'
            });
        }
        const scooter = checkScooter.rows[0];
        if(scooter.battery_level < 10){
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'batareya seviyyesi asagidir'
            })
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

        // 1. İcarə, Cüzdan və Skuter məlumatlarını birlikdə çəkirik
        const activeRental = await client.query(
            `SELECT r.id, r.scooter_id, r.start_time, r.total_minutes, r.total_cost, 
                    w.id as wallet_id, w.balance, s.battery_level
             FROM rentals r
             JOIN wallets w ON r.user_id = w.user_id
             JOIN scooters s ON r.scooter_id = s.id
             WHERE r.user_id = $1 AND r.status = $2 
             FOR UPDATE OF r, w, s`,
            [userId, 'active']
        );

        if (activeRental.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'İcarədə olan skuter tapılmadı' });
        }

        const rental = activeRental.rows[0];
        const { id: rentalId, scooter_id: scooterId, wallet_id: walletId, battery_level: currentBattery } = rental;

        // 2. Vaxtı JS tərəfində tam milisaniyə ilə dəqiq hesablama (UTC xətasını önləyir)
        const startTime = new Date(rental.start_time).getTime();
        const currentTime = new Date().getTime();
        const totalElapsedMinutes = Math.max(1, Math.ceil((currentTime - startTime) / (1000 * 60)));
        const paidMinutes = parseInt(rental.total_minutes || 0, 10);
        const unpaidMinutes = Math.max(0, totalElapsedMinutes - paidMinutes);

        let currentBalance = parseFloat(rental.balance);
        let finalCost = parseFloat(rental.total_cost || 0);

        // 3. Ödənilməmiş dəqiqələrin ödənişi
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
                    `INSERT INTO wallet_transactions (wallet_id, amount, transaction_type) VALUES ($1, $2, $3)`,
                    [walletId, actualCharge, 'PAYMENT']
                );
            }
            finalCost = parseFloat((finalCost + actualCharge).toFixed(2));
        }

        // 4. Batareya hesablanması (Məsələn: hər 2 dəqiqəyə 1% batareya gedir)
        const batteryDeduction = Math.floor(totalElapsedMinutes / 2);
        const newBatteryLevel = Math.max(0, currentBattery - batteryDeduction);

        // 5. Bazada İcarə və Skuter məlumatlarını yeniləmək
        const updateRental = await client.query(
            `UPDATE rentals 
             SET end_time = NOW(), total_minutes = $1, total_cost = $2, status = $3 
             WHERE id = $4 RETURNING *`,
            [totalElapsedMinutes, finalCost, 'completed', rentalId]
        );

        const updateScooter = await client.query(
            `UPDATE scooters 
             SET status = $1, battery_level = $2 
             WHERE id = $3 RETURNING *`,
            ['available', newBatteryLevel, scooterId]
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
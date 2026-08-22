const db = require('../config/db');

const topUp = async(req, res, next) => {
    const {amount} = req.body;
    const userId = req.user.id;
    if(!amount || amount < 1.00 || isNaN(amount)){
        return res.status(400).json({
            success: false,
            message: 'daxil etdiyiniz melumat sedir'
        })
    }
    const client = await db.connect();
    try{
        await client.query('BEGIN');
        const walletResult = await client.query(
            'SELECT id, balance FROM wallets WHERE user_id = $1', 
            [userId]
        );

        if(walletResult.rows.length === 0){
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'istifadeciye uygun melumat tapilmadi'
            })
        };
        const walletId = walletResult.rows[0].id

        const updateWallets = await client.query(
            'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 RETURNING * ',
             [amount, userId]
            );
        const transactionResult = await client.query(
            'INSERT INTO wallet_transactions(wallet_id, amount, transaction_type) VALUES($1,$2,$3) RETURNING *',
            [walletId, amount, 'TOP_UP']
        );
        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: 'balans ugurla artirildi',
            data:{
                wallet: updateWallets.rows[0],
                transaction: transactionResult.rows[0]
            }
        });     
    }catch(error) {
        await client.query('ROLLBACK');
        next(error)
    }finally{
        client.release();
    }
}
const getWallet = async(req, res, next) => {
    const userId = req.user.id;
    try{
        const walletResult= await db.query('SELECT * FROM wallets WHERE user_id =$1', [userId]);
        if(walletResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'daxil etdiyiniz istifadeciye uygun hesab tapilmadi'
            })
        }
        res.status(200).json({
            success: true,
            message: 'hesab ugurla tapildi',
            data: walletResult.rows[0]
        })
    }catch(error){ 
        next(error);
    }

}
module.exports = {
    topUp,
    getWallet
}
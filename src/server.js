require('dotenv').config();
const express = require('express');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req,res) => {
    res.status(200).json({
        status: "success",
        message: "server isleyir"
    })
})

app.post('/scooters', async(req, res, next) => {
    try{
        const {code,battery_level,status} = req.body;
          if(!code || battery_level === undefined){
            return res.status(400).json({
                success: false,
                message: 'skoter kodu ve bataraye seviyesi mutleq daxil edilmelidir'
            })
        };
        const sqlText = 'INSERT INTO scooters(code, battery_level, status) VALUES($1, $2, $3) RETURNING *';
        const values = [code, battery_level, status || 'available'];
        const result = await db.query(sqlText, values);
        res.status(201).json({
            success: true,
            message: 'melumatlar ugurla daxil edildi',
            data: result.rows[0]
        });
    }catch(error){
        next(error);
    }
    
})
app.get('/scooters', async(req, res, next) => {
    try{
        const {status, battery_level} = req.query;

        let sql = 'SELECT * FROM scooters WHERE is_active = true';
        const condition = [];
        const params = [];
        if(status) {
            params.push(status);
            condition.push(`status = $${params.length}`);
        };
        if(battery_level) {
            params.push(battery_level);
            condition.push(`battery_level >= $${params.length}`)
        };
        if(condition.length > 0){
            sql += ' AND ' + condition.join(' AND ');
        };
        const result = await db.query(sql,params);
        res.json(result.rows);
    }catch(err){
        next(err);
    }
});

app.get('/scooters/:id', async(req, res, next) => {
    try{
        const {id} = req.params;
        const result = await db.query('SELECT * FROM scooters WHERE id=$1 AND is_active = true', [id]);
        if(result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'daxil etdiyiniz id sefdi'
            })
        }
        res.status(200).json({
            success: true,
            message: 'netice ugurludur',
            data: result.rows[0]
        })
    }catch(error) {
        next(error);
    }
});

app.patch('/scooters/:id', async(req, res, next) => {
    try{
        const { id } = req.params;
        const { status, battery_level } = req.body;
        
        const updates = [];
        const values = [];

        if(status !== undefined){
            values.push(status);
            updates.push(`status = $${values.length}`);
        };
        if(battery_level !== undefined) {
            values.push(battery_level);
            updates.push(`battery_level = $${values.length}`);
        };
        if(updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'hec bir melumatlari daxil etmemisiz'
            })
        };
        values.push(id);


        let sqlText = `
            UPDATE scooters
            SET ${updates.join(', ')}
            WHERE id = $${values.length} AND is_active = true
            RETURNING *        
        `;
        const result = await db.query(sqlText, values);
        if(result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'yazdigin ID-a uygun melumat tapilmadi'
            })
        }
        res.status(200).json({
            success: true,
            message: 'melumatlar ugurla deyisildi',
            data: result.rows[0]
        })

    }catch(error){
        next(error);
    }

})

app.delete('/scooters/:id', async(req, res, next) => {
    try{
        const { id } = req.params;
        let sqlText = `
                UPDATE scooters
                SET is_active = false
                WHERE id = $1
                RETURNING *
        `;
        const result = await db.query(sqlText, [id]);
        if(result.rows.length === 0) {
           return res.status(404).json({
                success: false,
                message: 'sef melumat daxil etmisiz'
            })
        }
        res.status(200).json({
            success: true,
            message: 'soft delet ugurla heyata kecirildi',
            data: result.rows[0]
        })



    }catch(error){
        next(error);
    }
})
// tanimlanmayan endpoint
 app.use((req, res, next) => {
    const error = new Error('daxil etdiyiniz endpoint sefdir');
    error.statusCode = 404;
    next(error);
 });
// error handling
 app.use((err, req, res, next) => {

    const statusCode = err.statusCode || 500
    console.error('bir promblem yarandi', err.stack);

    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: err.message || 'serverde bilinmeyen bir xeta oldu',
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    })
 })


app.listen(PORT, ()=>{
    console.log(`listening on port: ${PORT}`)
});
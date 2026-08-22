const db = require('../config/db');

//get scooters

const getAllScooters = async(req, res, next) => {
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
        res.status(200).json({
            success: true,
            data: result.rows
        });
    }catch(err){
        next(err);
    }
}
const getNearbyScooters = async(req, res, next) => {
    try{
        const {lat, lng, radius = 1} = req.query;
        if(!lat || !lng){
            return res.status(400).json({
                success: false,
                message: 'melumatlari tam daxil etmemisiz'
            })
        }
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius);

        if(isNaN(userLat) || isNaN(userLng) || isNaN(radiusKm)){
            return res.status(400).json({
                success: false,
                message: 'daxil etdiyiniz melumatlar eded olmalidir'
            })
        }
        const query = `
            SELECT 
                id,
                code,
                battery_level,
                status,
                latitude,
                longitude,
                ROUND(
                    (6371 * acos(
                        LEAST(1.0, GREATEST(-1.0,
                            cos(radians($1)) * cos(radians(latitude)) * 
                            cos(radians(longitude) - radians($2)) + 
                            sin(radians($1)) * sin(radians(latitude))
                        ))
                    ))::numeric, 2
                ) AS distance_km
            FROM scooters
            WHERE status = 'available' 
              AND is_active = true
              AND latitude IS NOT NULL 
              AND longitude IS NOT NULL
              AND (
                  6371 * acos(
                      LEAST(1.0, GREATEST(-1.0,
                          cos(radians($1)) * cos(radians(latitude)) * 
                          cos(radians(longitude) - radians($2)) + 
                          sin(radians($1)) * sin(radians(latitude))
                      ))
                  )
              ) <= $3
            ORDER BY distance_km ASC;
        `;
        const result = await db.query(query, [userLat, userLng, radiusKm]);
        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        })

    }catch(error){
        next(error);
    }
}

//get scooters id

const getScootersById = async(req, res, next) => {
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
}

// create

const createScooters = async(req, res, next) => {
    try{
        const {code,battery_level,status, latitude, longitude} = req.body;
          if(!code || battery_level === undefined){
            return res.status(400).json({
                success: false,
                message: 'skoter kodu ve bataraye seviyesi mutleq daxil edilmelidir'
            })
        };
        if ((status === 'available' || !status) && (latitude === undefined || longitude === undefined)) {
            return res.status(400).json({
                success: false,
                message: "Xəritədə görünməsi üçün 'available' statuslu skuterin koordinatları daxil edilməlidir."
            });
        }
        const sqlText = 'INSERT INTO scooters(code, battery_level, status, latitude, longitude) VALUES($1, $2, $3, $4, $5) RETURNING *';
        const values = [code, battery_level, status || 'available', latitude || null, longitude || null];
        const result = await db.query(sqlText, values);
        res.status(201).json({
            success: true,
            message: 'melumatlar ugurla daxil edildi',
            data: result.rows[0]
        });
    }catch(error){
        next(error);
    }
}

//update

const updateScooters = async(req, res, next) => {
    try{
        const { id } = req.params;
        const { status, battery_level, latitude, longitude } = req.body;
        
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
        if (latitude !== undefined) {
            values.push(latitude);
            updates.push(`latitude = $${values.length}`);
        }
        if (longitude !== undefined) {
            values.push(longitude);
            updates.push(`longitude = $${values.length}`);
        }
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

}

//delet

const deleteScooters = async(req, res, next) => {
    try{
        const { id } = req.params;
        let sqlText = `
                UPDATE scooters
                SET is_active = false
                WHERE id = $1 AND is_active = true
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
}
module.exports = {
    getAllScooters,
    getNearbyScooters,
    getScootersById,
    createScooters,
    updateScooters,
    deleteScooters
};
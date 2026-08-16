require('dotenv').config();

const fs = require('fs');
const path = require('path');

const db = require('../config/db')

const initDatabase = async () => {
    try{

        const sqlPath = path.join(__dirname, 'schema.sql');
        const sqlQuery = fs.readFileSync(sqlPath, 'utf8');
        
        await db.query(sqlQuery);
        console.log('cedvel yaradildi hec bir problem yoxdur');
        process.exit()
    }catch(error){
        console.error(error.message);
        process.exit(-1);
    }
}
initDatabase();
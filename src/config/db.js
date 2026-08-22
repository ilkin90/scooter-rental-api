const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log("database ile elaqe ugurludur");
});

pool.on('error', (err) => {
    console.log("bir xeta bas verdi: ", err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(), // authController ucun(getClient)
    connect: () => pool.connect()    // rentalCron ve digerleri ucun
};
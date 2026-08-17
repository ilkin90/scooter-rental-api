require('dotenv').config();
const express = require('express');
const scooterRoutes = require('./routes/scooterRoutes')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req,res) => {
    res.status(200).json({
        status: "success",
        message: "server isleyir"
    })
})

app.use('/scooters', scooterRoutes);

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
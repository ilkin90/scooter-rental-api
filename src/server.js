require('dotenv').config();
const express = require('express');
const scooterRoutes = require('./routes/scooterRoutes');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const startRentalCron = require('./services/rentalCron'); // Cron daxil edilir

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "server isleyir"
    });
});

app.use('/api/scooters', scooterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rentals', rentalRoutes);

// Tanımlanmayan endpoint
app.use((req, res, next) => {
    const error = new Error('Daxil etdiyiniz endpoint səhvdir');
    error.statusCode = 404;
    next(error);
});

// Error handling
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error('Bir problem yarandı:', err.stack);

    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: err.message || 'Serverdə bilinməyən bir xəta oldu',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
    
    // server baslayan kimi cron avtomatik ise dusur
    startRentalCron();
});
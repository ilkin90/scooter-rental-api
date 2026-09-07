const rateLimit = require('express-rate-limit');

// Qlobal Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false, 
    message: {
        success: false,
        message: 'Həddindən artıq sorğu göndərildi. Zəhmət olmasa bir qədər gözləyin.'
    }
});

// hessas emeliyyatlar ucun
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Çox sayda cəhd edildi. Zəhmət olmasa 15 dəqiqə sonra yenidən sınayın.'
    }
});

module.exports = {
    globalLimiter,
    authLimiter
};
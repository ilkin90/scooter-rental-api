const { body, query, param } = require('express-validator');

// GET /api/scooters
const getAllScootersValidation = [
    query('status')
        .optional()
        .isIn(['available', 'in_use', 'maintenance']).withMessage('Yanlış status filtri'),
    
    query('battery_level')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Batareya səviyyəsi 0-100 arası integer olmalıdır')
];

// GET /api/scooters/nearby
const getNearbyScootersValidation = [
    query('lat')
        .notEmpty().withMessage('lat (enlik) parametri tələb olunur')
        .isFloat({ min: -90, max: 90 }).withMessage('lat düzgün koordinat rəqəmi olmalıdır'),

    query('lng')
        .notEmpty().withMessage('lng (uzunluq) parametri tələb olunur')
        .isFloat({ min: -180, max: 180 }).withMessage('lng düzgün koordinat rəqəmi olmalıdır'),

    query('radius')
        .optional()
        .isFloat({ gt: 0 }).withMessage('radius sıfırdan böyük rəqəm olmalıdır')
];

// GET /api/scooters/:id
const getScooterByIdValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('Skuter ID-si müsbət integer olmalıdır')
];

// POST /api/scooters
const createScooterValidation = [
    body('code')
        .notEmpty().withMessage('Skuter kodu tələb olunur')
        .isString().withMessage('Skuter kodu mətn formatında olmalıdır'),

    body('battery_level')
        .notEmpty().withMessage('Batareya səviyyəsi tələb olunur')
        .isInt({ min: 0, max: 100 }).withMessage('Batareya səviyyəsi 0-100 arası olmalıdır'),

    body('status')
        .optional()
        .isIn(['available', 'in_use', 'maintenance']).withMessage('Yanlış status daxil edilib'),

    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Düzgün latitude daxil edin'),

    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Düzgün longitude daxil edin')
];

// PATCH /api/scooters/:id
const updateScooterValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('Skuter ID-si müsbət integer olmalıdır'),

    body('status')
        .optional()
        .isIn(['available', 'in_use', 'maintenance']).withMessage('Yanlış status daxil edilib'),

    body('battery_level')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Batareya səviyyəsi 0-100 arası olmalıdır'),

    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Düzgün latitude daxil edin'),

    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Düzgün longitude daxil edin')
];

// DELETE /api/scooters/:id
const deleteScooterValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('Skuter ID-si müsbət integer olmalıdır')
];

module.exports = {
    getAllScootersValidation,
    getNearbyScootersValidation,
    getScooterByIdValidation,
    createScooterValidation,
    updateScooterValidation,
    deleteScooterValidation
};
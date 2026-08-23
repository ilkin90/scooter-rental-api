const { body } = require('express-validator');

const startRentalValidation = [
    body('scooterId')
        .notEmpty().withMessage('Skuter ID-si daxil edilməlidir')
        .isInt({ gt: 0 }).withMessage('Skuter ID-si müsbət tam ədəd olmalıdır')
];

module.exports = {
    startRentalValidation
};
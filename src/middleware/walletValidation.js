const { body } = require('express-validator');

const topUpValidation = [
    body('amount')
        .notEmpty().withMessage('Məbləğ daxil edilməlidir')
        .isFloat({ min: 1.00 }).withMessage('Minimum artırma məbləği 1.00 AZN olmalıdır')
];

module.exports = {
    topUpValidation
};
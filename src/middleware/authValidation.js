const { body } = require('express-validator');

const registerValidation = [
    body('email')
        .notEmpty().withMessage('email daxil edilməlidir')
        .isEmail().withMessage('Düzgün email formatı daxil edin'),

    body('password')
        .notEmpty().withMessage('password daxil edilməlidir')
        .isLength({ min: 6 }).withMessage('Şifrə ən azı 6 simvol olmalıdır')
];

const loginValidation = [
    body('email')
        .notEmpty().withMessage('email daxil edilməlidir')
        .isEmail().withMessage('Düzgün email formatı daxil edin'),

    body('password')
        .notEmpty().withMessage('password daxil edilməlidir')
];

module.exports = {
    registerValidation,
    loginValidation
};
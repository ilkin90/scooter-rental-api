const {validationResult} = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'daxil edilen melumatlar yanlisdir',
            errors: errors.array().map( err => ({
                field: err.path,
                message: err.msg
            }))
        })
    }
    next();
}
module.exports = validate;
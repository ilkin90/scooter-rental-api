const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) {
        return res.status(401).json({
            success: false,
            message: 'giris ucun token teleb olunur'
        })
    }
    try{
        const decodePayLoad = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodePayLoad;
        next();
    }catch(error){
        res.status(403).json({
            success: false,
            message: 'token etibarsizdir ve ya vaxti bitib'
        });
    }

}

const requireAdmin = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    } else{
        return res.status(403).json({
            success: false,
            message: 'buna icazeniz yoxdur'
        })
    }
}

module.exports = {
    authenticateToken,
    requireAdmin
};
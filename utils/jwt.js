const jwt = require('jsonwebtoken');

exports.guardarTokenCookie = (res, token) => {
    res.cookie('jwt_echo', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', 
        path: '/', 
        maxAge: 24 * 60 * 60 * 1000 
    });
};

exports.limpiarTokenCookie = (res) => {
    res.clearCookie('jwt_echo');
};

exports.decodificarToken = (token) => {
    try {

        return jwt.verify(token, process.env.SECRET_KEY);
        
    } catch (error) {

        return null;
    }
};
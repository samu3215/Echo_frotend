

exports.guardarTokenCookie = (res, token) => {
    res.cookie('jwt_echo', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000 // 1 día de vigencia
    });
};

exports.limpiarTokenCookie = (res) => {
    res.clearCookie('jwt_echo');
};
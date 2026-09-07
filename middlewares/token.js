const jwtUtils = require('../utils/jwt');

exports.datosUsuarioLogueado = (req, res, next) => {
    const token = req.cookies.jwt_echo;

    if (token) {
        const datosToken = jwtUtils.decodificarToken(token);

        res.locals.usuarioLogueado = datosToken; 
    } else {
        res.locals.usuarioLogueado = null;
    }
    next();
};
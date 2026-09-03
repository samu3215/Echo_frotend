const usuarioApi = require('../api/usuario');
const mensajesBakend = require('../utils/mensajes');
const jwtUtils = require('../utils/jwt');

exports.mostrarInicio = (req, res) => {
    res.render('pages/inicio');
};

exports.selecFormulario = (req, res) => {
    res.render('pages/registro'); 
};

exports.mostrarFormulario = (req, res) => {
    const tipo = req.params.tipo;
    
    if (tipo !== 'usu' && tipo !== 'empres') {
        return res.redirect('/');
    }

    res.render('pages/formulario', { tipo, error: null });
};

exports.procesarRegistro = async (req, res) => {
    const payload = req.body;
    payload.tipo_usuario = payload.tipo_url === 'usu' ? 'normal' : 'empresarial';

    try {
        const respuesta = await usuarioApi.crearUsuario(payload);
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);
        
        return res.render('pages/login', { 
            exito: resultado.mensaje 
        });

    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response);
        
        return res.render('pages/formulario', { 
            tipo: payload.tipo_url, 
            error: resultado.mensaje 
        });
    }
};

exports.mostrarLogin = (req, res) => {
    res.render('pages/login', { error: null });
};

exports.procesarLogin = async (req, res) => {
    const credenciales = {
        identificador: req.body.nombre_usuario, 
        password: req.body.password
    };

    try {
        const respuesta = await usuarioApi.loginUsuario(credenciales);
        
        jwtUtils.guardarTokenCookie(res, respuesta.data.token);

        res.redirect('/inicio'); 

    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response);     
        
        return res.render('pages/login', { 
            error: resultado.mensaje 
        });
    }
};
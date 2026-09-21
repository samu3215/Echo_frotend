const usuarioApi = require('../api/usuario');
const mensajesBakend = require('../utils/mensajes');
const jwtUtils = require('../utils/jwt');
const publicacionesApi = require('../api/publicaciones')



exports.selecFormulario = (req, res) => {

    const token = req.cookies.jwt_echo

    if (token){
        return res.redirect(`/inicio?exito=ya estas registrado`)
    }

    res.render('pages/registro'); 
};

exports.mostrarFormulario = (req, res) => {

    const token = req.cookies.jwt_echo

    if (token){
        return res.redirect(`/inicio?exito=ya estas resgistrado`)
    }
    
    const tipo = req.params.tipo;
    
    if (tipo !== 'usu' && tipo !== 'empres') {
        return res.redirect('/');
    }

    res.render('pages/formulario', { tipo, error: null });
};

exports.procesarRegistro = async (req, res) => {

    const cuerpito = req.body;

    cuerpito.tipo_usuario = cuerpito.tipo_url === 'usu' ? 'normal' : 'empresarial';

    try {

        if (req.file) {
            const respuestaMultimedia = await publicacionesApi.subirArchivo(req.file, 'perfiles');
            cuerpito.foto_perfil = respuestaMultimedia.data.url;
        }


        const respuesta = await usuarioApi.crearUsuario(cuerpito);
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);
        
        return res.render('pages/login', { 
            exito: resultado.mensaje 
        });

    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response);
        
        return res.render('pages/formulario', { 
            tipo: cuerpito.tipo_url, 
            error: resultado.mensaje 
        });
    }
};

exports.mostrarLogin = (req, res) => {

    const token = req.cookies.jwt_echo

    if (token){
        return res.redirect(`/inicio?exito=Ya estas logueado`)
    }
    const error = req.query.error || null;
    const exito = req.query.exito || null;

    res.render('pages/login', { 
        error: error,
        exito: exito 
    });
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
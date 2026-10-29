const usuarioApi = require('../api/usuario')
const mensajesBakend = require('../utils/mensajes')
const jwtUtils = require('../utils/jwt')
const cloudinary = require('../services/cloudinary')


exports.selecFormulario = (req, res) => {
    const token = req.cookies.jwt_echo

    if (token){
        req.flash('exito', 'ya estas registrado')
        return res.redirect(`/inicio`)
    }

    res.render('pages/registro'); 
}

exports.mostrarFormulario = (req, res) => {
    const token = req.cookies.jwt_echo

    if (token){
        req.flash('exito', 'ya estas resgistrado')
        return res.redirect(`/inicio`)
    }
    
    const tipo = req.params.tipo
    
    if (tipo !== 'usu' && tipo !== 'empres') {
        return res.redirect('/formulario')
    }

    res.render('pages/formulario', { tipo, error: null });
}

exports.verificarDisponibilidadRegistro = async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const nombreUsuario = typeof req.body.nombre_usuario === 'string' ? req.body.nombre_usuario.trim().toLowerCase() : '';
    const telefono = typeof req.body.telefono === 'string' ? req.body.telefono.replace(/\D/g, '') : '';

    if (!email || !nombreUsuario) {
        return res.status(400).json({ error: 'Completa correo, usuario y teléfono para verificar disponibilidad.' });
    }

    try {
        const respuesta = await usuarioApi.listarUsuarios();
        const usuarios = Array.isArray(respuesta)
            ? respuesta
            : Array.isArray(respuesta && respuesta.results)
                ? respuesta.results
                : Array.isArray(respuesta && respuesta.data)
                    ? respuesta.data
                    : null;

        if (!usuarios) {
            console.error('La consulta de usuarios no devolvió una lista válida para verificar el registro.');
            return res.status(502).json({
                error: 'No se pudo verificar la disponibilidad de los datos. Inténtalo de nuevo.'
            });
        }

        const duplicados = {
            email: usuarios.some(usuario =>
                usuario
                && typeof usuario.email === 'string'
                && usuario.email.trim().toLowerCase() === email
            ),
            nombre_usuario: usuarios.some(usuario =>
                usuario
                && typeof usuario.nombre_usuario === 'string'
                && usuario.nombre_usuario.trim().toLowerCase() === nombreUsuario
            ),
            telefono: telefono ? usuarios.some(u => u?.telefono && String(u.telefono).replace(/\D/g, '').slice(-10) === telefono.slice(-10)) : false
        };

        return res.json({ duplicados });
    } catch (error) {
        console.error('No se pudo verificar la disponibilidad del registro.', {
            status: error.response && error.response.status,
            message: error.message
        });
        return res.status(502).json({
            error: 'No se pudo verificar la disponibilidad de los datos. Inténtalo de nuevo.'
        });
    }
};

exports.enviarCodigoRegistro = async (req, res) => {
    try {
        await usuarioApi.enviarCodigoRegistro(req.body.email);
        return res.json({ exito: true });
    } catch (error) {
        return res.status(400).json({ error: error.response?.data?.error || 'Error al enviar código' });
    }
};

exports.verificarCodigoRegistro = async (req, res) => {
    try {
        await usuarioApi.verificarCodigoRegistro(req.body.email, req.body.codigo);
        return res.json({ exito: true });
    } catch (error) {
        return res.status(400).json({ error: error.response?.data?.error || 'Código inválido' });
    }
};

exports.validarAceptacionTerminos = (req, res, next) => {
    if (req.body.acepta_terminos === 'aceptado') {
        return next();
    }

    const tipo = ['usu', 'empres'].includes(req.body.tipo_url) ? req.body.tipo_url : 'usu';

    return res.status(400).render('pages/formulario', {
        tipo,
        error: 'Debes aceptar los Términos y Condiciones para completar el registro.'
    });
};

exports.procesarRegistro = async (req, res) => {
    const cuerpito = req.body;
    delete cuerpito.acepta_terminos;

    cuerpito.tipo_usuario = cuerpito.tipo_url === 'usu' ? 'normal' : 'empresarial';

    try {

        if (req.file) {
            const urlSegura = await cloudinary.subirArchivoCloudinary(req.file, 'perfiles', true)
            cuerpito.foto_perfil = urlSegura;
        }

        const respuesta = await usuarioApi.crearUsuario(cuerpito);
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta)

        return res.render('pages/login', { 
            exito: resultado.mensaje,
            limpiarBorradorRegistro: ['usu', 'empres'].includes(cuerpito.tipo_url)
                ? cuerpito.tipo_url
                : null
        });

    } catch (error) {

        const resultado = mensajesBakend.extraerMensajeError(error)
        
        return res.render('pages/formulario', { 
            tipo: cuerpito.tipo_url, 
            error: resultado
        })
    }
}

exports.mostrarLogin = (req, res) => {
    const token = req.cookies.jwt_echo

    if (token){
        req.flash('exito', 'Ya estas logueado')
        return res.redirect(`/inicio`)
    }
    const error = res.locals.error || null;
    const exito = res.locals.exito || null;

    res.render('pages/login', { 
        error,
        exito,
        limpiarBorradorRegistro: null
    });
};

exports.mostrarTerminos = (req, res) => {
    const tipoRegistro = ['usu', 'empres'].includes(req.query.tipo) ? req.query.tipo : null;
    const desdeRegistro = req.query.from === 'registro' && tipoRegistro;

    res.render('pages/terminos', {
        terminosVolver: desdeRegistro ? `/registro/${tipoRegistro}` : '/configuracion/',
        textoVolver: desdeRegistro ? 'Volver al registro' : 'Volver a Configuraciones'
    });
};

exports.procesarLogin = async (req, res) => {

    const credenciales = {
        identificador: req.body.nombre_usuario, 
        password: req.body.password
    }

    try {

        const respuesta = await usuarioApi.loginUsuario(credenciales)
        jwtUtils.guardarTokenCookie(res, respuesta.data.token)
        req.flash('exito', 'logueado con exito')
        res.redirect('/inicio')

    } catch (error) {
        const resultado = mensajesBakend.extraerMensajeError(error)  
        
        return res.render('pages/login', { 
            error: resultado.mensaje 
        })
    }
}
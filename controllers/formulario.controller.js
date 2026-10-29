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
    const nombreUsuario = typeof req.body.nombre_usuario === 'string'
        ? req.body.nombre_usuario.trim().toLowerCase()
        : '';
    const telefono = typeof req.body.telefono === 'string'
        ? req.body.telefono.replace(/\D/g, '')
        : '';

    if (!email || !nombreUsuario || !telefono) {
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
            telefono: usuarios.some(usuario =>
                usuario
                && usuario.telefono !== undefined
                && usuario.telefono !== null
                && String(usuario.telefono).replace(/\D/g, '').slice(-10) === telefono.slice(-10)
            )
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

exports.mostrarCambioContrasena = (req, res) => {
    res.render('pages/cambio-contraseña');
};

exports.mostrarTerminos = (req, res) => {
    const tipoRegistro = ['usu', 'empres'].includes(req.query.tipo) ? req.query.tipo : null;
    const desdeRegistro = req.query.from === 'registro' && tipoRegistro;

    res.render('pages/terminos', {
        terminosVolver: desdeRegistro ? `/registro/${tipoRegistro}` : '/configuracion/',
        textoVolver: desdeRegistro ? 'Volver al registro' : 'Volver a Configuraciones'
    });
};

const responderErrorRecuperacion = (res, error) => {
    const respuesta = error.response ? error.response.data : error;
    const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);

    return res.status(error.response ? error.response.status : 502).json({
        error: error.response
            ? resultado.mensaje
            : 'No se pudo conectar con el servidor. Inténtalo de nuevo.'
    });
};

exports.solicitarCodigoRecuperacion = async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
    }

    try {
        const respuesta = await usuarioApi.solicitarCodigoRecuperacion(email);
        const expiresIn = Number(respuesta && respuesta.expira_en);

        if (!Number.isSafeInteger(expiresIn) || expiresIn <= 0) {
            return res.status(502).json({
                error: 'El servidor no devolvió un tiempo de expiración válido para el código.'
            });
        }

        return res.json({
            expira_en: expiresIn,
            mensaje: respuesta.mensaje || 'Si el correo está asociado a una cuenta, recibirás un código de verificación.'
        });
    } catch (error) {
        console.error('Error al solicitar el código de recuperación en Django.', {
            method: error.config && error.config.method,
            baseURL: error.config && error.config.baseURL,
            url: error.config && error.config.url,
            code: error.code,
            status: error.response && error.response.status,
            message: error.message
        });
        return responderErrorRecuperacion(res, error);
    }
};

exports.verificarCodigoRecuperacion = async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const codigo = typeof req.body.codigo === 'string' ? req.body.codigo.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(codigo)) {
        return res.status(400).json({ error: 'Ingresa el correo y un código de 6 dígitos.' });
    }

    try {
        const respuesta = await usuarioApi.verificarCodigoRecuperacion(email, codigo);
        const resetToken = respuesta && (
            respuesta.token
            || respuesta.access_token
            || respuesta.temp_token
            || respuesta.reset_token
        );

        if (typeof resetToken !== 'string' || !resetToken) {
            return res.status(502).json({
                error: 'El servidor no devolvió el token temporal de recuperación.'
            });
        }

        return res.json({ reset_token: resetToken });
    } catch (error) {
        return responderErrorRecuperacion(res, error);
    }
};

exports.restablecerContrasena = async (req, res) => {
    const resetToken = [req.body.token, req.body.temp_token, req.body.reset_token]
        .find((valor) => typeof valor === 'string' && valor);
    const nuevaPassword = [req.body.password, req.body.nueva_password]
        .find((valor) => typeof valor === 'string') || '';
    const confirmarPassword = [req.body.confirmar_password, req.body.confirm_password]
        .find((valor) => typeof valor === 'string') || '';

    if (!resetToken) {
        return res.status(400).json({ error: 'La verificación expiró. Solicita un nuevo código.' });
    }

    if (nuevaPassword.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    if (nuevaPassword !== confirmarPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    try {
        await usuarioApi.restablecerContrasena(resetToken, {
            token: resetToken,
            password: nuevaPassword,
            confirmar_password: confirmarPassword
        });

        jwtUtils.limpiarTokenCookie(res);
        return res.json({ message: 'Contraseña restablecida correctamente.' });
    } catch (error) {
        return responderErrorRecuperacion(res, error);
    }
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
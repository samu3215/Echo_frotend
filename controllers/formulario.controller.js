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

exports.procesarRegistro = async (req, res) => {
    const cuerpito = req.body;
    cuerpito.tipo_usuario = cuerpito.tipo_url === 'usu' ? 'normal' : 'empresarial';

    try {

        if (req.file) {
            const urlSegura = await cloudinary.subirArchivoCloudinary(req.file, 'perfiles', true)
            cuerpito.foto_perfil = urlSegura;
        }

        const respuesta = await usuarioApi.crearUsuario(cuerpito);
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta)

        return res.render('pages/login', { 
            exito: resultado.mensaje

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


    res.render('pages/login', { 
        error: res.locals.error || null,
        exito:  res.locals.exito || null 
    })
}

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
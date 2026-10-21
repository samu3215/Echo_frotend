const usuarioApi = require('../api/usuario');
const mensajesBakend = require('../utils/mensajes');
const jwtUtils = require('../utils/jwt');
const cloudinary = require('../services/cloudinary')
const publicacionApi = require('../api/publicaciones')
const publicacionesController = require('../controllers/publicacion.controller')
const comunidadApi = require('../api/comunidad')
const comunidadController = require('../controllers/comunidad.controller')


exports.mostrarPerfil = async (req, res) => {
    const nombreUsu = req.params.nombre_usuario
    const token = req.cookies.jwt_echo
    const seccion = req.query.seccion || 'publicaciones'
    

    try{

        const usuarioPerfil = await usuarioApi.listarUsuario(nombreUsu)
        let publicaciones = []
        let comunidadesCreadas = []
        let comunidadesUnidas = []
        let tieneSiguiente = false  

        if (seccion === 'publicaciones') {

            const respuestaPubs = await publicacionApi.listarPublicacionesUsuario(nombreUsu, 1, token)
            
            publicaciones = publicacionesController.formatearPublicaciones(respuestaPubs.data.results || [], res.locals.usuarioLogueado)
            tieneSiguiente = respuestaPubs.data.next ? true : false;
        }

        if (seccion === 'likes') {
            const respuestaLikes = await publicacionApi.listarPublicacionesLikesUsuario(nombreUsu, 1, token)

            publicaciones = publicacionesController.formatearPublicaciones(respuestaLikes.data.results || [], res.locals.usuarioLogueado)
            tieneSiguiente = respuestaLikes.data.next ? true : false;
        }

        if (seccion === 'comunidades') {
            const respuestaCreadas = await comunidadApi.listarComunidades({ usuario: nombreUsu }, token);
            
            const respuestaUnidas = await comunidadApi.listarComunidades({ unidas: 'true', usuario: nombreUsu }, token);

            comunidadesCreadas = comunidadController.formatearComunidades(respuestaCreadas.data.results || [], res.locals.usuarioLogueado)
            comunidadesUnidas = comunidadController.formatearComunidades(respuestaUnidas.data.results || [], res.locals.usuarioLogueado)
        }

        res.render('pages/perfil', {
            usuarioPerfil,
            seccion: seccion,
            publicaciones: publicaciones, 
            tieneSiguiente,
            comunidadesCreadas: comunidadesCreadas,
            comunidadesUnidas: comunidadesUnidas,
            exito: res.locals.exito || null, 
            error: res.locals.error || null
        })

    }catch(error){
        const mensajeError = mensajesBakend.extraerMensajeError(error)
        req.flash('error', mensajeError)
        return res.redirect(`/inicio`)
    }
    
}

exports.actualizarPerfil = async (req,res) =>{
    const nombreUsuActual = req.params.nombre_usuario
    const cuerpito = req.body
    const token = req.cookies.jwt_echo

    if (!token) {
        req.flash('error', 'Debes iniciar sesión para editar tu perfil')
        return res.redirect(`/inicio`);
    }

    try{

        if (!cuerpito.password) {
            delete cuerpito.password
            delete cuerpito.confirmar_password
        }

        if(req.file){
            
            const respuestaMultimedia = await cloudinary.subirArchivoCloudinary(req.file, 'perfiles', true)
            cuerpito.foto_perfil = respuestaMultimedia
        }

        const respuesta = await usuarioApi.actualizarUsuario(nombreUsuActual, cuerpito, token)

        if (respuesta && respuesta.token) {
            jwtUtils.guardarTokenCookie(res, respuesta.token)

            if (res.locals.usuarioLogueado) {
                res.locals.usuarioLogueado.nombre_usuario = cuerpito.nombre_usuario || nombreUsuActual;
            }
        }

        const nuevoNombre = cuerpito.nombre_usuario || nombreUsuActual

        req.flash('exito', 'Perfil actualizado con éxito')
        return res.redirect(`/perfil/${nuevoNombre}`)


    }catch(error) {

        mensajeError = mensajesBakend.extraerMensajeError(error) || 'algo salio mal intentalo de nuevo'
        req.flash('error', mensajeError)
        return res.redirect(`/perfil/${nombreUsuActual}`)
    }
}

exports.mostrarConfiguracion = (req, res) => {
    const token = req.cookies.jwt_echo

    if (!token){
        req.flash('error', 'debes iniciar sesion para acceder a ese sitio')
        return res.redirect(`/inicio`)
    }

    try {
        res.render('pages/configuracion', {
            exito: res.locals.exito || null,
            error: res.locals.error || null
        })

    } catch (error) {
        res.redender('pages/perfil',{
            exito: null,
            error:'no se pudo cargar la configuracion'
        })
    }
}

exports.cerrarSesion = async (req,res) => {
    try{

        jwtUtils.limpiarTokenCookie(res)

        if (res.locals) {
            res.locals.usuarioLogueado = null;
        }
        req.flash('exito', 'Sesión cerrada correctamente')
        return res.redirect('/login')
    }
    catch(error){
        req.flash('error', 'Error al cerrar sesión')
        return res.redirect('/configuracion')
    }
}

exports.eliminarUsuario = async (req,res) =>{

    const token = req.cookies.jwt_echo;
    const usuarioLogueado = res.locals.usuarioLogueado
    
    if (!token || !usuarioLogueado) {
        req.flash('error', 'Debes iniciar sesión para editar tu perfil')
        return res.redirect(`/login`)
    }

    const usuarioEliminado = usuarioLogueado.nombre_usuario

    try{

        const respuesta = await usuarioApi.eliminarUsuarios(usuarioEliminado, token)
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta)
        const mensajeRes = resultado.mensaje || 'cuenta eliminada correctamente'
        
        jwtUtils.limpiarTokenCookie(res)

        if (res.locals) {
            res.locals.usuarioLogueado = null
        }

        req.flash('exito', mensajeRes)
        return res.redirect(`/login`)

    }
    catch(error){
        
        const mensajeError = mensajesBakend.extraerMensajeError(error)
        req.flash('error', mensajeError)
        return res.redirect(`/configuracion`)

    }
}
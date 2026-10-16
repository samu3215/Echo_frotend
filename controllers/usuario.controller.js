const usuarioApi = require('../api/usuario');
const mensajesBakend = require('../utils/mensajes');
const jwtUtils = require('../utils/jwt');
const cloudinary = require('../services/cloudinary')
const publicacionApi = require('../api/publicaciones')
const publicacionesController = require('../controllers/publicacion.controller')


exports.mostrarPerfil = async (req, res) => {
    const nombreUsu = req.params.nombre_usuario
    const token = req.cookies.jwt_echo
    const seccion = req.query.seccion || 'publicaciones'
    

    try{
        const usuarioPerfil = await usuarioApi.listarUsuario(nombreUsu)

        let publicaciones = [];
        let tieneSiguiente = false;

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

        res.render('pages/perfil', {
            usuarioPerfil,
            seccion: seccion,
            publicaciones: publicaciones, 
            tieneSiguiente,
            exito: req.query.exito || null, 
            error: req.query.error || null
        });

    }catch(error){

        const respuesta = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);
        return res.redirect(`/inicio/?error=${encodeURIComponent(resultado.mensaje)}`);
    }
    
};

exports.actualizarPerfil = async (req,res) =>{
    const nombreUsuActual = req.params.nombre_usuario
    const cuerpito = req.body
    const token = req.cookies.jwt_echo

    if (!token) {
        return res.redirect(`/login?error=Debes iniciar sesión para editar tu perfil`);
    }

    try{

        if (!cuerpito.password) {
            delete cuerpito.password;
            delete cuerpito.confirmar_password;
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

        return res.redirect(`/perfil/${nuevoNombre}?exito=Perfil actualizado con éxito`)


    }catch(error) {

        const respuesta = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);
        return res.redirect(`/perfil/${nombreUsuActual}?error=${encodeURIComponent(resultado.mensaje)}`);
    }
}

exports.mostrarConfiguracion = (req, res) => {
    const token = req.cookies.jwt_echo

    if (!token){
        return res.redirect(`/login?error=debes iniciar sesion para acceder a ese sitio`)
    }

    try {
        res.render('pages/configuracion', {
            exito: req.query.exito || null,
            error: req.query.error || null
        });
    } catch (error) {
        res.redender('pages/perfil',{
            exito: null,
            error:'no se pudo cargar la configuracion'
        });
    }
};

exports.cerrarSesion = async (req,res) => {
    try{

        jwtUtils.limpiarTokenCookie(res)

        if (res.locals) {
            res.locals.usuarioLogueado = null;
        }
        
        return res.redirect('/login?exito=Sesión cerrada correctamente');
    }
    catch(error){

        return res.redirect('/configuracion?error=Error al cerrar sesión');
    }
}

exports.eliminarUsuario = async (req,res) =>{

    const token = req.cookies.jwt_echo;
    const usuarioLogueado = res.locals.usuarioLogueado
    
    if (!token || !usuarioLogueado) {
        return res.redirect(`/login?error=Debes iniciar sesión para editar tu perfil`);
    }

    const usuarioEliminado = usuarioLogueado.nombre_usuario


    try{

        const respuesta = await usuarioApi.eliminarUsuarios(usuarioEliminado, token)
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta)
        const mensajeRes = resultado.mensaje || 'cuenta eliminada correctamente'
        
        jwtUtils.limpiarTokenCookie(res)

        if (res.locals) {
            res.locals.usuarioLogueado = null;
        }

        return res.redirect(`/login?exito=${encodeURIComponent(mensajeRes)}`)

    }
    catch(error){

        const respuesta = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);
        return res.redirect(`/configuracion/?error=${encodeURIComponent(resultado.mensaje)}`)

    }
}
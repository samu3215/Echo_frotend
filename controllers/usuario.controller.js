const usuarioApi = require('../api/usuario');
const publicacionApi = require('../api/publicaciones')
const mensajesBakend = require('../utils/mensajes');
const jwtUtils = require('../utils/jwt');


exports.mostrarPerfil = async (req, res) => {
    const nombreUsu = req.params.nombre_usuario

    try{
        const usuarioPerfil = await usuarioApi.listarUsuario(nombreUsu)
        const seccion = req.query.seccion || 'publicaciones';

        res.render('pages/perfil', {
            usuarioPerfil,
            seccion: seccion,
            exito: req.query.exito || null, 
            error: req.query.error || null
        });

    }catch(error){

        res.render('pages/perfil',{
            
            usuarioPerfil: null,
            seccion: 'publicaciones',
            exito: null,
            error: 'El usuario solicitado no existe'
        })
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
            const respuestaMultimedia = await publicacionApi.subirArchivo(req.file, 'perfiles')
            cuerpito.foto_perfil = respuestaMultimedia.data.url
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
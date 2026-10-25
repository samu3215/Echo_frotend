// const usuarioApi = require('../api/usuario');
// const publicacionApi = require('../api/publicaciones')
// const mensajesBakend = require('../utils/mensajes');
// const jwtUtils = require('../utils/jwt');






// // Renderizar la vista del formulario
// exports.renderConfiguracion = (req, res) => {
//     // Supongamos que guardas la info del usuario en la sesión o res.locals
//     res.render('configuracion', { 
//         usuario: req.session.usuario || {} 
//     });
// };

// // Procesar el envío del formulario
// exports.procesarConfiguracion = async (req, res) => {
//     try {
//         const token = req.session.token; // O donde almacenes tu JWT
//         const { nombre_completo, biografia, sitio_web, privado } = req.body;

//         const payload = {
//             nombre_completo,
//             biografia,
//             sitio_web,
//             privado: privado === 'on' || privado === true
//         };

//         const respuesta = await actualizarConfiguracionApi(token, payload);
        
//         // Actualizar datos locales de sesión si aplica
//         req.session.usuario = { ...req.session.usuario, ...respuesta.data.usuario };

//         res.redirect('/perfil?exito=true');
//     } catch (error) {
//         console.error("Error al actualizar configuración:", error);
//         res.render('configuracion', { 
//             error: "No se pudieron guardar los cambios.",
//             usuario: req.body 
//         });
//     }
// };




























// exports.mostrarPerfil = async (req, res) => {
//     const nombreUsu = req.params.nombre_usuario

//     try{
//         const usuarioPerfil = await usuarioApi.listarUsuario(nombreUsu)
//         const seccion = req.query.seccion || 'publicaciones';

//         res.render('pages/perfil', {
//             usuarioPerfil,
//             seccion: seccion,
//             exito: req.query.exito || null, 
//             error: req.query.error || null
//         });

//     }catch(error){

//         res.render('pages/perfil',{
            
//             usuarioPerfil: null,
//             seccion: 'publicaciones',
//             exito: null,
//             error: 'El usuario solicitado no existe'
//         })
//     }
    
// };

// exports.actualizarPerfil = async (req,res) =>{
//     const nombreUsuActual = req.params.nombre_usuario
//     const cuerpito = req.body
//     const token = req.cookies.jwt_echo

//     if (!token) {
//         return res.redirect(`/login?error=Debes iniciar sesión para editar tu perfil`);
//     }

//     try{

//         if (!cuerpito.password) {
//             delete cuerpito.password;
//             delete cuerpito.confirmar_password;
//         }

//         if(req.file){
//             const respuestaMultimedia = await publicacionApi.subirArchivo(req.file, 'perfiles')
//             cuerpito.foto_perfil = respuestaMultimedia.data.url
//         }

//         const respuesta = await usuarioApi.actualizarUsuario(nombreUsuActual, cuerpito, token)

//         if (respuesta && respuesta.token) {
//             jwtUtils.guardarTokenCookie(res, respuesta.token)

//             if (res.locals.usuarioLogueado) {
//                 res.locals.usuarioLogueado.nombre_usuario = cuerpito.nombre_usuario || nombreUsuActual;
//             }
//         }

//         const nuevoNombre = cuerpito.nombre_usuario || nombreUsuActual

//         return res.redirect(`/perfil/${nuevoNombre}?exito=Perfil actualizado con éxito`)


//     }catch(error) {
//         const respuesta = error.response ? error.response.data : error;


//         const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);
    

//         return res.redirect(`/perfil/${nombreUsuActual}?error=${encodeURIComponent(resultado.mensaje)}`);
//     }
// }

// exports.mostrarConfiguracion = (req, res) => {
//     const token = req.cookies.jwt_echo

//     if (!token){
//         return res.redirect(`/login?error=debes iniciar sesion para acceder a ese sitio`)
//     }

//     try {
//         res.render('pages/configuracion', {
//             exito: req.query.exito || null,
//             error: req.query.error || null
//         });
//     } catch (error) {
//         res.redender('pages/perfil',{
//             exito: null,
//             error:'no se pudo cargar la configuracion'
//         });
//     }
// };

// exports.cerrarSesion = async (req,res) => {
//     try{

//         jwtUtils.limpiarTokenCookie(res)

//         if (res.locals) {
//             res.locals.usuarioLogueado = null;
//         }
        
//         return res.redirect('/login?exito=Sesión cerrada correctamente');
//     }
//     catch(error){

//         return res.redirect('/configuracion?error=Error al cerrar sesión');
//     }
// }

// exports.eliminarUsuario = async (req,res) =>{

//     const token = req.cookies.jwt_echo;
//     const usuarioLogueado = res.locals.usuarioLogueado
    
//     if (!token || !usuarioLogueado) {
//         return res.redirect(`/login?error=Debes iniciar sesión para editar tu perfil`);
//     }

//     const usuarioEliminado = usuarioLogueado.nombre_usuario


//     try{

//         const respuesta = await usuarioApi.eliminarUsuarios(usuarioEliminado, token)

//         const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta)
//         const mensajeRes = resultado.mensaje || 'cuenta eliminada correctamente'
        
//         jwtUtils.limpiarTokenCookie(res)

//         if (res.locals) {
//             res.locals.usuarioLogueado = null;
//         }

//         return res.redirect(`/login?exito=${encodeURIComponent(mensajeRes)}`)

//     }
//     catch(error){
//         const respuesta = error.response ? error.response.data : error;

//         const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);

//         return res.redirect(`/configuracion/?error=${encodeURIComponent(resultado.mensaje)}`)

//     }
// }




const usuarioApi = require('../api/usuario');
const publicacionApi = require('../api/publicaciones');
const mensajesBakend = require('../utils/mensajes');
const jwtUtils = require('../utils/jwt');

// Renderizar la vista de perfil de un usuario
exports.mostrarPerfil = async (req, res) => {
    const nombreUsu = req.params.nombre_usuario;

    try {
        const usuarioPerfil = await usuarioApi.listarUsuario(nombreUsu);
        const seccion = req.query.seccion || 'publicaciones';

        res.render('pages/perfil', {
            layout: false, // <-- AÑADE ESTA LÍNEA AQUÍ
            usuarioPerfil,
            seccion: seccion,
            exito: req.query.exito || null, 
            error: req.query.error || null
        });

    } catch (error) {
        res.render('pages/perfil', {
            layout: false, // <-- Y TAMBIÉN AQUÍ
            usuarioPerfil: null,
            seccion: 'publicaciones',
            exito: null,
            error: 'El usuario solicitado no existe'
        });
    }
};

// Actualizar la información del perfil del usuario
exports.actualizarPerfil = async (req, res) => {
    const nombreUsuActual = req.params.nombre_usuario;
    const cuerpito = req.body;
    const token = req.cookies.jwt_echo;

    if (!token) {
        return res.redirect('/login?error=Debes iniciar sesión para editar tu perfil');
    }

    try {
        if (!cuerpito.password) {
            delete cuerpito.password;
            delete cuerpito.confirmar_password;
        }

        if (req.file) {
            const respuestaMultimedia = await publicacionApi.subirArchivo(req.file, 'perfiles');
            cuerpito.foto_perfil = respuestaMultimedia.data.url;
        }

        const respuesta = await usuarioApi.actualizarUsuario(nombreUsuActual, cuerpito, token);

        if (respuesta && respuesta.token) {
            jwtUtils.guardarTokenCookie(res, respuesta.token);

            if (res.locals.usuarioLogueado) {
                res.locals.usuarioLogueado.nombre_usuario = cuerpito.nombre_usuario || nombreUsuActual;
            }
        }

        const nuevoNombre = cuerpito.nombre_usuario || nombreUsuActual;

        return res.redirect(`/perfil/${nuevoNombre}?exito=Perfil actualizado con éxito`);

    } catch (error) {
        const respuesta = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);

        return res.redirect(`/perfil/${nombreUsuActual}?error=${encodeURIComponent(resultado.mensaje)}`);
    }
};

// Renderizar la vista de configuración
exports.mostrarConfiguracion = (req, res) => {
    const token = req.cookies.jwt_echo;

    if (!token) {
        return res.redirect('/login?error=Debes iniciar sesión para acceder a este sitio');
    }

    try {
        res.render('pages/configuracion', {
            layout: false, // <-- DESACTIVA EL LAYOUT AUTOMÁTICO
            exito: req.query.exito || null,
            error: req.query.error || null
        });
    } catch (error) {
        res.redirect('/perfil?error=No se pudo cargar la configuración');
    }
};

// Procesar el formulario de ajustes/configuración desde el panel
exports.procesarConfiguracion = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const usuarioLogueado = res.locals.usuarioLogueado;

    if (!token || !usuarioLogueado) {
        return res.redirect('/login?error=Debes iniciar sesión para guardar cambios');
    }

    try {
        const { nombre_completo, biografia, sitio_web, privado } = req.body;

        const payload = {
            nombre_completo,
            biografia,
            sitio_web,
            privado: privado === 'on' || privado === true
        };

        const respuesta = await usuarioApi.actualizarConfiguracionApi(token, payload);

        if (res.locals.usuarioLogueado) {
            Object.assign(res.locals.usuarioLogueado, respuesta.data.usuario);
        }

        return res.redirect('/configuracion?exito=Configuración guardada correctamente');
    } catch (error) {
        const respuesta = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);

        return res.redirect(`/configuracion?error=${encodeURIComponent(resultado.mensaje)}`);
    }
};

// Cerrar la sesión activa limpiando cookies
exports.cerrarSesion = async (req, res) => {
    try {
        jwtUtils.limpiarTokenCookie(res);

        if (res.locals) {
            res.locals.usuarioLogueado = null;
        }

        return res.redirect('/login?exito=Sesión cerrada correctamente');
    } catch (error) {
        return res.redirect('/configuracion?error=Error al cerrar sesión');
    }
};

// Eliminar la cuenta de usuario activa
exports.eliminarUsuario = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const usuarioLogueado = res.locals.usuarioLogueado;

    if (!token || !usuarioLogueado) {
        return res.redirect('/login?error=Debes iniciar sesión para realizar esta acción');
    }

    const usuarioEliminado = usuarioLogueado.nombre_usuario;

    try {
        const respuesta = await usuarioApi.eliminarUsuarios(usuarioEliminado, token);
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);
        const mensajeRes = resultado.mensaje || 'Cuenta eliminada correctamente';

        jwtUtils.limpiarTokenCookie(res);

        if (res.locals) {
            res.locals.usuarioLogueado = null;
        }

        return res.redirect(`/login?exito=${encodeURIComponent(mensajeRes)}`);

    } catch (error) {
        const respuesta = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(respuesta);

        return res.redirect(`/configuracion?error=${encodeURIComponent(resultado.mensaje)}`);
    }
};




const axios = require('axios');

exports.mostrarConfiguracion = async (req, res) => {
    try {
        const token = req.cookies.jwt_echo;
        const datosToken = res.locals.usuarioLogueado || {};
        let perfilUsuario = {};

        // Si tenemos token y un usuario decodificado
        if (token && (datosToken.nombre_usuario || datosToken.username)) {
            const username = datosToken.nombre_usuario || datosToken.username;

            // Hacemos la consulta a la URL de Django que ya responde 200 OK
            const respuestaDjango = await axios.get(`http://127.0.0.1:8000/api/usuarios/${username}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            perfilUsuario = respuestaDjango.data;
        }

        res.render('pages/configuracion', {
            usuarioLogueado: perfilUsuario,
            exito: req.query.exito || null,
            error: req.query.error || null
        });

    } catch (error) {
        console.error('Error al obtener usuario desde Django:', error.message);
        res.render('pages/configuracion', {
            usuarioLogueado: res.locals.usuarioLogueado || {},
            exito: null,
            error: null
        });
    }
};
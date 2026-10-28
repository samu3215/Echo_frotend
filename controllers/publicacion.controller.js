const usuarioApi = require('../api/usuario')
const publicacionApi = require('../api/publicaciones')
const cloudinary = require('../services/cloudinary')
const mensajesBakend = require('../utils/mensajes')
const comunidadApi = require('../api/comunidad')
const comunidadController = require('../controllers/comunidad.controller')


exports.formatearPublicaciones = (publicaciones, usuarioLogueado) => {
    return publicaciones.map(post => {
        
        let nombreAutor = 'Usuario'

        if (post.usuario && post.usuario.nombre_usuario) {
            nombreAutor = post.usuario.nombre_usuario

        } else if (post.usuario) {
            nombreAutor = post.usuario
        }

        let tieneMiLike = false

        if (usuarioLogueado && post.likes_publicacion && Array.isArray(post.likes_publicacion)) {
            tieneMiLike = post.likes_publicacion.some(like => {
                return like.usuario && like.usuario.id === usuarioLogueado.user_id
            })
        }

        let esDueno = false

        if (usuarioLogueado) {
            esDueno = (usuarioLogueado.nombre_usuario === nombreAutor)
        }

        let fotoSegura = '/img/avatar.webp'
        if (post.usuario && post.usuario.foto_perfil) {
            fotoSegura = post.usuario.foto_perfil
        }

        let fechaFormateada = ''
        if (post.fecha_creacion) {
            fechaFormateada = new Date(post.fecha_creacion).toLocaleDateString();
        }

        return {
            ...post,
            nombreAutorSeguro: nombreAutor,
            fotoSegura: fotoSegura,
            tieneMiLike: tieneMiLike,
            esDueno: esDueno,
            fechaFormateada: fechaFormateada
        }
    })
}

exports.mostrarCreacionPublicaciones = (req, res) => {
    const token = req.cookies.jwt_echo

    if (!token) {
        req.flash('error', 'Debes iniciar sesión para publicar')
        return res.redirect('/inicio')
    }

    res.render('pages/crear', {
        error: res.locals.error || null,
        exito: res.locals.exito || null
    })
}

exports.crearPublicacion = async (req, res) => {

    const token = req.cookies.jwt_echo
    const usuarioLogueado = res.locals.usuarioLogueado 

    if (!token || !usuarioLogueado) {
        req.flash('error','Debes iniciar sesión para publicar')
        return res.redirect('/inicio')
    }

    try {
        let datosPublicacion = {
            descripcion: req.body.descripcion || "",
            comentarios_activados: req.body.desactivar_comentarios !== 'on',
            archivos: []
        };

        if (req.files && req.files.length > 0) {
            let orden = 1
            

            for (let archivo of req.files) {

                const urlSegura = await cloudinary.subirArchivoCloudinary(archivo, 'publicaciones', false)
                const tipoMedia = archivo.mimetype.includes('video') ? 'video' : 'imagen'
                
                datosPublicacion.archivos.push({
                    url_media: urlSegura,
                    tipo_media: tipoMedia,
                    orden: orden
                })
                orden++
            }
        }

        const respuesta = await publicacionApi.crearPublicacion(datosPublicacion, token)
        const mensajeExito = respuesta.data.mensaje || 'Publicación creada exitosamente'
        req.flash('exito', mensajeExito)
        
        return res.redirect(`/inicio`)

    } catch (error) {

        const mensajeError = mensajesBakend.extraerMensajeError(error)
        req.flash('error', mensajeError)
        return res.redirect(`/crear`)
    }
}



exports.eliminarPublicacion = async (req, res) => {

    const token = req.cookies.jwt_echo
    const usuarioLogueado = res.locals.usuarioLogueado
    const idPublicacion = req.params.id

    if (!token || !usuarioLogueado) {
        req.flash('error', 'Debes iniciar sesión para realizar esta acción')
        return res.redirect('/inicio')
    }

    try {
        const respuesta = await publicacionApi.eliminarPublicacion(idPublicacion, token)
        const mensajeExito = respuesta.data.mensaje || 'Publicación eliminada correctamente'

        req.flash('exito', mensajeExito)
        return res.redirect(`/inicio`)
        
    } catch (error) {
        const mensajeError = mensajesBakend.extraerMensajeError(error)
        req.flash('error', mensajeError)
        return res.redirect(`/inicio`)
    }
}



exports.mostrarEditar = async (req, res) => {
    const token = req.cookies.jwt_echo
    const usuarioLogueado = res.locals.usuarioLogueado
    const idPublicacion = req.params.id
    
    if (!token || !usuarioLogueado) {
        req.flash('error', 'Debes iniciar sesión para editar')
        return res.redirect('/inicio')
    } 

    try {

        const respuesta = await publicacionApi.obtenerPublicacion(idPublicacion, token)
        const publicacion = respuesta.data;


        if (publicacion.usuario.nombre_usuario !== usuarioLogueado.nombre_usuario) {
            req.flash('error','No tienes permiso para editar esta publicación')
            return res.redirect('/inicio')
        }

        res.render('pages/editar', { 
            publicacion: publicacion,
            error: res.locals.error || null 
        })

    } catch (error) {

        req.flash('error', 'No se pudo cargar la publicación a editar')
        return res.redirect('/inicio')

    }
}

exports.editarPublicacion = async (req, res) => {

    const token = req.cookies.jwt_echo
    const usuarioLogueado = res.locals.usuarioLogueado
    const idPublicacion = req.params.id
    
    if (!token || !usuarioLogueado) {
        req.flash('error', 'Debes iniciar sesión para editar')
        return res.redirect('/inicio')
    }

    try {
        
        const comentariosDesactivados = req.body.desactivar_comentarios === 'on'
        
        const datosEditados = {
            descripcion: req.body.descripcion || "",
            comentarios_activados: !comentariosDesactivados 
        }

        
        if (req.body.archivo_id && req.body.archivo_orden) {
            const ids = Array.isArray(req.body.archivo_id) ? req.body.archivo_id : [req.body.archivo_id]
            const ordenes = Array.isArray(req.body.archivo_orden) ? req.body.archivo_orden : [req.body.archivo_orden]
            
            
            datosEditados.archivos = ids.map((id, i) => ({
                id: Number(id),
                orden: Number(ordenes[i])
            }))

        } else {
            
            datosEditados.archivos = []
        }
        
        const respuesta = await publicacionApi.editarPublicacion(idPublicacion, datosEditados, token)
        const mensajeExito = respuesta.data.mensaje || 'Publicación actualizada correctamente'

        req.flash('exito', mensajeExito)
        return res.redirect(`/inicio`)
        
    } catch (error) {

        const mensajeError = mensajesBakend.extraerMensajeError(error)
        req.flash('error', mensajeError)
        return res.redirect(`/editar/${idPublicacion}`)
    }
}

exports.darLike = async (req, res) => {

    const token = req.cookies.jwt_echo
    const idPublicacion = req.params.id

    if (!token) {
        req.flash('error', 'Inicia sesión para dar like');
        return res.status(401).json({ error: 'Debes iniciar sesión para dar like' })
    }

    try {

        await publicacionApi.darLike(idPublicacion, token)
        return res.status(200).json({ exito: true })

    } catch (error) {
        
        return res.status(500).json({ error: 'Error al procesar el like' })
    }
}

exports.mostrarInicio = async (req, res) => {

    const token = req.cookies.jwt_echo

    try {
        const respuesta = await publicacionApi.listarPublicaciones(1, token)
        const publicacionesFormateadas = exports.formatearPublicaciones(respuesta.data.results || [], res.locals.usuarioLogueado)

        res.render('pages/inicio', {
            exito: res.locals.exito || null,
            error: res.locals.error || null,
            publicaciones: publicacionesFormateadas,
            tieneSiguiente: respuesta.data.next ? true : false
        })

    } catch (error) {
        
        res.render('pages/inicio', {
            exito: res.locals.exito || null,
            error: res.locals.error || 'No se pudo cargar el feed de publicaciones.',
            publicaciones: [],
            tieneSiguiente: false 
        })
    }
}

exports.mostrarBusqueda = async (req, res) => {

    const token = req.cookies.jwt_echo
    const seccion = req.query.seccion || 'publicaciones'
    const queryBuscador = req.query.q || ''
    const categoriaActual = req.query.categoria || ''
    try {
        const listUsuarios = await usuarioApi.listarUsuarios(token)
        const usuarios = listUsuarios.filter(u => u.tipo_usuario === 'normal')
        const negocios = listUsuarios.filter(u => u.tipo_usuario === 'empresarial')
        
        
        let publicaciones = []
        let comunidades = []
        let tieneSiguiente = false

        if (seccion === 'publicaciones') {

            const respuestaPubs = await publicacionApi.listarPublicaciones(1, token)

            publicaciones = exports.formatearPublicaciones(respuestaPubs.data.results || [], res.locals.usuarioLogueado)
            tieneSiguiente = respuestaPubs.data.next ? true : false
        }

        if (seccion === 'comunidades') {
            const paramsComunidad = {
                page: 1,
                categoria: categoriaActual,
                buscar: queryBuscador 
            }

            const respuestaCom = await comunidadApi.listarComunidades(paramsComunidad, token)

            comunidades = comunidadController.formatearComunidades(respuestaCom.data.results || [], res.locals.usuarioLogueado)
            tieneSiguiente = respuestaCom.data.next ? true : false
        }

        res.render('pages/buscar', {
            seccion: seccion,
            usuarios: usuarios,     
            comunidades: comunidades,  
            publicaciones: publicaciones,      
            negocios: negocios,
            tieneSiguiente,
            queryBuscador: queryBuscador,     
            categoriaActual: categoriaActual,
            error: null
        })
    
    } catch (error) {
        res.render('pages/buscar', {
            seccion: seccion,
            publicaciones: [],
            usuarios: [],
            comunidades: [],
            negocios: [],
            tieneSiguiente: false,
            queryBuscador: queryBuscador,
            categoriaActual: categoriaActual,
            error: res.locals.error  || 'No se pudieron cargar los datos'
        })
    }
}

exports.crearComentario = async (req, res) => {

    const token = req.cookies.jwt_echo
    const idPublicacion = req.params.id
    const contenido = req.body.contenido

    if (!token) {
        req.flash('error', 'Debes iniciar sesión para comentar')
        return res.status(401).json({ error: 'Debes iniciar sesión para comentar' })
    }

    try {
        const datos = {
            publicacion: idPublicacion,
            contenido: contenido
        }
        const respuesta = await publicacionApi.crearComentario(datos, token)
        
        return res.status(201).json({ exito: true, comentario: respuesta.data })
    } catch (error) {

        const dataError = error.response ? error.response.data : error
        const resultado = mensajesBakend.normalizarRespuestaBackend(dataError)
        return res.status(400).json({ error: resultado.mensaje })

    }
}


exports.cargarMasPublicaciones = async (req, res) => {

    const token = req.cookies.jwt_echo
    const pagina = req.query.page
    const origen = req.query.origen 
    const usuarioPerfil = req.query.usuario 

    try {

        let respuesta

        if (origen === 'perfil' && usuarioPerfil) {
            respuesta = await publicacionApi.listarPublicacionesUsuario(usuarioPerfil, pagina, token)
        } 

        else if (origen === 'likes' && usuarioPerfil) {
            respuesta = await publicacionApi.listarPublicacionesLikesUsuario(usuarioPerfil, pagina, token)
        } 
        else {
            respuesta = await publicacionApi.listarPublicaciones(pagina, token)
        }

        const publicacionesFormateadas = exports.formatearPublicaciones(respuesta.data.results || [], res.locals.usuarioLogueado)

        const tieneSiguiente = respuesta.data.next ? true : false


        res.render('partials/solo-tarjetas', 
            { publicaciones:publicacionesFormateadas },
            (err, html) => {
            if (err) return res.status(500).json({ error: 'Error de renderizado' })
            res.json({ html: html, tieneSiguiente: tieneSiguiente })
        })

    } catch (error) {
        res.status(500).json({ error: 'No se pudieron cargar más datos' })
    }
}

exports.editarComentario = async (req, res) => {

    const token = req.cookies.jwt_echo

    if (!token){
        req.flash('error', 'debes iniciar sesion para comentar')
        return res.status(401).json({ error: 'Debes iniciar sesión' })
    } 

    try {

        const respuesta = await publicacionApi.editarComentario(req.params.id, { contenido: req.body.contenido }, token)
        return res.status(200).json({ exito: true, comentario: respuesta.data })
        
    } catch (error) {

        req.flash('error', 'error al editar el comentario')
        return res.status(400).json({ error: 'Error al editar el comentario' })
    }
}

exports.eliminarComentario = async (req, res) => {
    const token = req.cookies.jwt_echo;
    if (!token){
        req.flash('error', 'Debes iniciar sesión')
        return res.status(401).json({ error: 'Debes iniciar sesión' })
    } 

    try {

        await publicacionApi.eliminarComentario(req.params.id, token)
        return res.status(200).json({ exito: true })

    } catch (error) {
        req.flash('error','Error al eliminar el comentario' )
        return res.status(400).json({ error: 'Error al eliminar el comentario' })
    }
}

exports.mostrarNotificaciones = async (req, res) => {
    const token = req.cookies.jwt_echo;
    
    if (!token) {
        req.flash('error', 'Debes iniciar sesión para ver tus notificaciones');
        return res.redirect('/inicio');
    }

    try {
        const respuestaBackend = await usuarioApi.obtenerNotificaciones(token);
        const notificaciones = respuestaBackend.lista || [];
        
        const notificacionesFormateadas = notificaciones.map(notif => {
            const fechaObj = new Date(notif.fecha_creacion);
            const horaStr = fechaObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            const fechaStr = fechaObj.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
            
            const autor = notif.usuario_origen || {};
            
            return {
                ...notif,
                tipo: notif.tipo, 
                puntuacion: notif.puntuacion || 0,
                tiempo_formateado: `${fechaStr}, ${horaStr}`,
                fotoSegura: autor.foto_perfil || '/img/avatar.webp',
                usuario_origen: autor.nombre_usuario 
            }
        })

        res.render('pages/notificaciones', {
            notificaciones: notificacionesFormateadas,
            error: res.locals.error || null,
            exito:res.locals.exito || null
        })

        if (respuestaBackend.sin_leer > 0) {
            try {
                await require('../api/usuario').marcarNotificacionesLeidas(token)
            } catch (err) {
                console.log('Error silencioso al marcar notificaciones')
            }
        }

    } catch (error) {
        res.render('pages/notificaciones', {
            notificaciones: [],
            error: 'No se pudieron cargar las notificaciones'
        })
    }
}

exports.obtenerConteoNotificaciones = async (req, res) => {
    const token = req.cookies.jwt_echo;
    if (!token) return res.status(401).json({ sin_leer: 0 })

    try {

        const respuesta = await usuarioApi.obtenerNotificaciones(token)
        return res.status(200).json({ sin_leer: respuesta.sin_leer || 0 })

    } catch (error) {
        return res.status(500).json({ sin_leer: 0 })
    }
}
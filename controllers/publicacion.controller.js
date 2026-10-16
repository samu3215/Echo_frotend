const usuarioApi = require('../api/usuario')
const publicacionApi = require('../api/publicaciones')
const cloudinary = require('../services/cloudinary')
const mensajesBakend = require('../utils/mensajes')



exports.formatearPublicaciones = (publicaciones, usuarioLogueado) => {
    return publicaciones.map(post => {
        
        let nombreAutor = 'Usuario'
        if (post.usuario && post.usuario.nombre_usuario) {
            nombreAutor = post.usuario.nombre_usuario
        } else if (post.usuario) {
            nombreAutor = post.usuario
        }

        let tieneMiLike = false;
        if (usuarioLogueado && post.likes_publicacion && Array.isArray(post.likes_publicacion)) {
            tieneMiLike = post.likes_publicacion.some(like => {
                return like.usuario && like.usuario.id === usuarioLogueado.user_id
            })
        }

        let esDueno = false;
        if (usuarioLogueado) {
            esDueno = (usuarioLogueado.nombre_usuario === nombreAutor)
        }

        let fotoSegura = '/img/avatar.webp';
        if (post.usuario && post.usuario.foto_perfil) {
            fotoSegura = post.usuario.foto_perfil
        }

        let fechaFormateada = '';
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
        return res.redirect('/login?error=Debes iniciar sesión para publicar')
    }

    res.render('pages/crear', {
        error: req.query.error || null,
        exito: req.query.exito || null
    })
}

exports.crearPublicacion = async (req, res) => {

    const token = req.cookies.jwt_echo
    const usuarioLogueado = res.locals.usuarioLogueado 

    if (!token || !usuarioLogueado) {
        return res.redirect('/login?error=Debes iniciar sesión para publicar')
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
        
        return res.redirect(`/perfil/${usuarioLogueado.nombre_usuario}?exito=${encodeURIComponent(mensajeExito)}`);

    } catch (error) {
        const dataError = error.response ? error.response.data : error
        const resultado = mensajesBakend.normalizarRespuestaBackend(dataError)
        return res.redirect(`/crear?error=${encodeURIComponent(resultado.mensaje)}`)
    }
}



exports.eliminarPublicacion = async (req, res) => {

    const token = req.cookies.jwt_echo
    const usuarioLogueado = res.locals.usuarioLogueado
    const idPublicacion = req.params.id

    if (!token || !usuarioLogueado) {
        return res.redirect('/login?error=Debes iniciar sesión para realizar esta acción')
    }

    try {
        const respuesta = await publicacionApi.eliminarPublicacion(idPublicacion, token)
        const mensajeExito = respuesta.data.mensaje || 'Publicación eliminada correctamente'

        return res.redirect(`/inicio?exito=${encodeURIComponent(mensajeExito)}`)
        
    } catch (error) {
        const dataError = error.response ? error.response.data : error
        const resultado = mensajesBakend.normalizarRespuestaBackend(dataError)
        return res.redirect(`/inicio?error=${encodeURIComponent(resultado.mensaje)}`)
    }
}



exports.mostrarEditar = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const usuarioLogueado = res.locals.usuarioLogueado;
    const idPublicacion = req.params.id;
    
    if (!token || !usuarioLogueado) {
        return res.redirect('/login?error=Debes iniciar sesión para editar');
    } 

    try {

        const respuesta = await publicacionApi.obtenerPublicacion(idPublicacion, token);
        const publicacion = respuesta.data;


        if (publicacion.usuario.nombre_usuario !== usuarioLogueado.nombre_usuario) {
            return res.redirect('/inicio?error=No tienes permiso para editar esta publicación');
        }

        res.render('pages/editar', { 
            publicacion: publicacion,
            error: req.query.error || null 
        });
    } catch (error) {
        return res.redirect('/inicio?error=No se pudo cargar la publicación a editar');
    }
}

exports.editarPublicacion = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const usuarioLogueado = res.locals.usuarioLogueado;
    const idPublicacion = req.params.id;
    
    if (!token || !usuarioLogueado) {
        return res.redirect('/login?error=Debes iniciar sesión para editar');
    }

    try {
        
        const comentariosDesactivados = req.body.desactivar_comentarios === 'on';
        
        const datosEditados = {
            descripcion: req.body.descripcion || "",
            comentarios_activados: !comentariosDesactivados 
        };

        
        if (req.body.archivo_id && req.body.archivo_orden) {
            const ids = Array.isArray(req.body.archivo_id) ? req.body.archivo_id : [req.body.archivo_id];
            const ordenes = Array.isArray(req.body.archivo_orden) ? req.body.archivo_orden : [req.body.archivo_orden];
            
            
            datosEditados.archivos = ids.map((id, i) => ({
                id: Number(id),
                orden: Number(ordenes[i])
            }));
        } else {
            
            datosEditados.archivos = [];
        }
        
        const respuesta = await publicacionApi.editarPublicacion(idPublicacion, datosEditados, token);
        const mensajeExito = respuesta.data.mensaje || 'Publicación actualizada correctamente';

        return res.redirect(`/perfil/${usuarioLogueado.nombre_usuario}?exito=${encodeURIComponent(mensajeExito)}`);
        
    } catch (error) {
        console.error("Error al editar:", error.response?.data || error.message);
        const dataError = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(dataError);
        return res.redirect(`/editar/${idPublicacion}?error=${encodeURIComponent(resultado.mensaje)}`);
    }
}




exports.darLike = async (req, res) => {

    const token = req.cookies.jwt_echo
    const idPublicacion = req.params.id

    if (!token) {
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
            exito: req.query.exito || null,
            error: req.query.error || null,
            publicaciones: publicacionesFormateadas,
            tieneSiguiente: respuesta.data.next ? true : false
        })

    } catch (error) {
        
        res.render('pages/inicio', {
            exito: req.query.exito || null,
            error: req.query.error || 'No se pudo cargar el feed de publicaciones.',
            publicaciones: [],
            tieneSiguiente: false 
        })
    }
}

exports.mostrarBusqueda = async (req, res) => {

    const token = req.cookies.jwt_echo
    const seccion = req.query.seccion || 'publicaciones'

    try {
        const listUsuarios = await usuarioApi.listarUsuarios();
        const usuarios = listUsuarios.filter(u => u.tipo_usuario === 'normal')
        const negocios = listUsuarios.filter(u => u.tipo_usuario === 'empresarial')

        let publicaciones = []
        let tieneSiguiente = false

        if (seccion === 'publicaciones') {
            const respuestaPubs = await publicacionApi.listarPublicaciones(1, token)
            publicaciones = exports.formatearPublicaciones(respuestaPubs.data.results || [], res.locals.usuarioLogueado)
            tieneSiguiente = respuestaPubs.data.next ? true : false
        }

        res.render('pages/buscar', {
            seccion: seccion,
            usuarios: usuarios,     
            comunidades: [],  
            publicaciones: publicaciones,      
            negocios: negocios,
            tieneSiguiente,
            error: null
        });
    
    } catch (error) {
        console.error("DETALLE DEL ERROR EN AXIOS:", error.response?.data || error.message);
        res.render('pages/buscar', {
            seccion: seccion,
            publicaciones: [],
            usuarios: [],
            comunidades: [],
            negocios: [],
            tieneSiguiente: false,
            error: req.query.error  || 'No se pudieron cargar los datos'
        })
    }
}

exports.crearComentario = async (req, res) => {

    const token = req.cookies.jwt_echo
    const idPublicacion = req.params.id
    const contenido = req.body.contenido

    if (!token) {
        return res.status(401).json({ error: 'Debes iniciar sesión para comentar' })
    }

    try {
        const datos = {
            publicacion: idPublicacion,
            contenido: contenido
        };
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

        const publicacionesFormateadas = exports.formatearPublicaciones(respuesta.data.results || [], res.locals.usuarioLogueado);

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
    const token = req.cookies.jwt_echo;
    if (!token) return res.status(401).json({ error: 'Debes iniciar sesión' });

    try {
        const respuesta = await publicacionApi.editarComentario(req.params.id, { contenido: req.body.contenido }, token);
        return res.status(200).json({ exito: true, comentario: respuesta.data });
    } catch (error) {
        return res.status(400).json({ error: 'Error al editar el comentario' });
    }
};

exports.eliminarComentario = async (req, res) => {
    const token = req.cookies.jwt_echo;
    if (!token) return res.status(401).json({ error: 'Debes iniciar sesión' });

    try {
        await publicacionApi.eliminarComentario(req.params.id, token);
        return res.status(200).json({ exito: true });
    } catch (error) {
        return res.status(400).json({ error: 'Error al eliminar el comentario' });
    }
};

exports.mostrarNotificaciones = (req, res) => {
    res.render('pages/notificaciones')
}


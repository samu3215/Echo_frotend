const comunidadApi = require('../api/comunidad')
const mensajesBakend = require('../utils/mensajes')
const cloudinary = require('../services/cloudinary')
const sse = require('../utils/sse')

exports.formatearComunidades = (comunidades, usuarioLogueado) => {
    return comunidades.map(comunidad => {
        let esDueno = false
        if (usuarioLogueado && comunidad.usuario) {
            esDueno = (usuarioLogueado.nombre_usuario === comunidad.usuario.nombre_usuario)
        }

        return {
            ...comunidad,
            esDueno: esDueno,
            fotoSegura: comunidad.foto_comunidad || '/img/avatar.webp',
            totalMiembros: comunidad.total_miembros || 0
        }
    })
}

exports.mostrarComunidades = async (req, res) => {

    const token = req.cookies.jwt_echo
    
    const params = {
        page: 1,
        categoria: req.query.categoria || '',
        buscar: req.query.buscar || '',
        unidas: req.query.unidas || '',
        seccionBuscar: req.query.seccionBuscar || ''
    }

    Object.keys(params).forEach(key => !params[key] && delete params[key])

    try {
        const respuesta = await comunidadApi.listarComunidades(params, token)
        const comunidadesFormateadas = exports.formatearComunidades(respuesta.data.results || [], res.locals.usuarioLogueado)

        res.render('pages/comunidades', {
            comunidades: comunidadesFormateadas,
            tieneSiguiente: respuesta.data.next ? true : false,
            filtrosActuales: params, 
            error: res.locals.error || null,
            exito: res.locals.exito ||null
        })

    } catch (error) {
        res.render('pages/comunidades', {
            comunidades: [],
            tieneSiguiente: false,
            filtrosActuales: params,
            error: 'No se pudieron cargar las comunidades.',
            exito: null
        })
    }
}


exports.cargarMasComunidades = async (req, res) => {
    const token = req.cookies.jwt_echo

    const params = {
        page: req.query.page || 2,
        categoria: req.query.categoria || '',
        buscar: req.query.buscar || '',
        unidas: req.query.unidas || '',
        usuario: req.query.usuario || '' 
    }

    Object.keys(params).forEach(key => !params[key] && delete params[key])

    try {
        const respuesta = await comunidadApi.listarComunidades(params, token)
        const comunidadesFormateadas = exports.formatearComunidades(respuesta.data.results || [], res.locals.usuarioLogueado)

        
        res.render('partials/solo-tarjetas-comunidad', { 
            comunidades: comunidadesFormateadas,
            filtrosActuales: params 
        }, (err, html) => {
            if (err) return res.status(500).json({ error: 'Error de renderizado' })
            res.json({ html: html, tieneSiguiente: respuesta.data.next ? true : false })
        })

    } catch (error) {
        res.status(500).json({ error: 'No se pudieron cargar más comunidades' })
    }
}

exports.mostrarCrearComunidad = (req, res) => {
    token = req.cookies.jwt_echo

    if (!token){
        req.flash('error', 'Debes iniciar sesión para crear una comunidad')
        return res.redirect('/comunidades')
        
    }
    res.render('pages/crear-comunidad', {
        modo: 'crear',
        comunidad: null,
        error: res.locals.error || null
    })
}

exports.crearComunidad = async (req, res) => {

    const token = req.cookies.jwt_echo
    if (!token){
        req.flash('error', 'Debes iniciar sesion')
        return res.redirect('/comunidades')
    } 

    try {
        let datosComunidad = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion || "",
            categoria: req.body.categoria
        }

        if (req.files && req.files.length > 0) {

            const archivoImagen = req.files[0]
            const urlSegura = await cloudinary.subirArchivoCloudinary(archivoImagen, 'comunidades', false)
            datosComunidad.foto_comunidad = urlSegura
        }

        const respuesta = await comunidadApi.crearComunidad(datosComunidad, token)
        req.flash('exito', 'Comunidad creada exitosamente')
        return res.redirect(`/comunidades`)

    } catch (error) {
        
        const mensajeError = mensajesBakend.extraerMensajeError(error) || 'hubo un error al crear comunidad'
        req.flash('error', mensajeError)
        return res.redirect(`/comunidades/crear`)
    }
}

exports.mostrarEditarComunidad = async (req, res) => {

    const token = req.cookies.jwt_echo
    const idComunidad = req.params.id

    if (!token){
        req.flash('error', 'Debes iniciar sesión')
        return res.redirect('/comunidades')
    } 

    try {
        const respuesta = await comunidadApi.obtenerComunidad(idComunidad, token)
        const comunidad = respuesta.data

        if (comunidad.usuario.nombre_usuario !== res.locals.usuarioLogueado.nombre_usuario) {

            req.flash('error', 'No tienes permiso para editar esta comunidad')
            return res.redirect('/comunidades')
        }

        res.render('pages/crear-comunidad', {
            modo: 'editar',
            comunidad: comunidad,
            error: res.locals.error || null
        })

    } catch (error) {

        req.flash('error', 'No se pudo cargar la comunidad')
        return res.redirect('/comunidades')
    }
}

exports.editarComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo
    const idComunidad = req.params.id

    if (!token) return res.redirect('/comunidades')

    try {
        let datosEditados = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            categoria: req.body.categoria
        }

        if (req.body.quitar_foto === 'true') {
            datosEditados.foto_comunidad = ''
        }

        if (req.files && req.files.length > 0) {

            const archivoImagen = req.files[0]
            const urlSegura = await cloudinary.subirArchivoCloudinary(archivoImagen, 'comunidades', false)
            datosEditados.foto_comunidad = urlSegura
        }
        
        await comunidadApi.editarComunidad(idComunidad, datosEditados, token)

        req.flash('exito', 'Comunidad actualizada correctamente')

        await comunidadApi.editarComunidad(idComunidad, datosEditados, token);
        sse.emitirEvento(idComunidad, 'comunidad_actualizada', { nombre: req.body.nombre });

        return res.redirect(`/comunidades`)

    } catch (error) {

        const mensajeError = mensajesBakend.extraerMensajeError(error) 
        req.flash('error', mensajeError)
        return res.redirect(`/comunidades/${idComunidad}/editar`)
    }
}

exports.eliminarComunidad = async (req, res) => {

    const token = req.cookies.jwt_echo
    const idComunidad = req.params.id

    if (!token){
        req.flash('error', 'Debes iniciar sesión')
        return res.redirect('/comunidades')
    } 

    try {
        await comunidadApi.eliminarComunidad(idComunidad, token)
        sse.emitirEvento(idComunidad, 'comunidad_eliminada', {});

        req.flash('exito', 'Comunidad eliminada exitosamente')
        return res.redirect('/comunidades')

    } catch (error) {
        req.flash('error', 'Error al eliminar la comunidad')
        return res.redirect(`/comunidades/${idComunidad}/editar`)
    }
}


exports.unirseOAbandonarComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo
    const idComunidad = req.params.id

    if (!token){

        req.flash('error', 'Debes iniciar sesión para unirte.')
        return res.redirect('/comunidades')
    } 

    try {

        const respuesta = await comunidadApi.unirseOAbandonar(idComunidad, token)
        
        let mensajeExito = 'Membresía actualizada'
        
        if (respuesta.status === 201) {
            mensajeExito = 'Te has unido a la comunidad exitosamente'
        } 

        else if (respuesta.status === 204) {
            mensajeExito = 'Has abandonado la comunidad'
        }
        req.flash('exito', mensajeExito)
        return res.redirect(`/comunidades`)

    } catch (error) {
        req.flash('error', 'Hubo un error en algo')
        return res.redirect('/comunidades')
    }
}

exports.mostrarChat = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idComunidad = req.params.id;

    try {
        const respuestaComunidad = await comunidadApi.obtenerComunidad(idComunidad, token);
        const comunidad = respuestaComunidad.data;
        const respuestaMensajes = await comunidadApi.listarMensajes(idComunidad, 1, token);
        
        let historialMensajes = [];
        if (respuestaMensajes.data && respuestaMensajes.data.results) {

            historialMensajes = respuestaMensajes.data.results.reverse();
        }

        let esDueno = false;
        if (res.locals.usuarioLogueado && comunidad.usuario.nombre_usuario === res.locals.usuarioLogueado.nombre_usuario) {
            esDueno = true;
        }

        const estoyUnido = comunidad.estoy_unido || esDueno;

        comunidad.fotoSegura = '/img/avatar.webp';
        if (comunidad.foto_comunidad && comunidad.foto_comunidad !== '/img/avatar.webp' && comunidad.foto_comunidad !== '/img/default-comunidad.webp') {
            comunidad.fotoSegura = comunidad.foto_comunidad;
        }

        res.render('pages/chat-comunidad', {
            comunidad: comunidad,
            esDueno: esDueno,
            estoyUnido: estoyUnido,
            historialMensajes: historialMensajes,
            error: res.locals.error || null
        });

    } catch (error) {
        req.flash('error', 'No se pudo cargar el chat');
        return res.redirect('/comunidades');
    }
};

exports.mostrarInfo = async (req, res) => {
    const token = req.cookies.jwt_echo
    const idComunidad = req.params.id

    if (!token) {
        req.flash('error', 'Debes iniciar sesión')
        return res.redirect('/login')
    }

    try {
        const resComunidad = await comunidadApi.obtenerComunidad(idComunidad, token)
        const resMiembros = await comunidadApi.listarMiembros(idComunidad, token)

        const comunidad = resComunidad.data
        const miembros = resMiembros.data
        
        let esDueno = false
        if (res.locals.usuarioLogueado && comunidad.usuario.nombre_usuario === res.locals.usuarioLogueado.nombre_usuario) {
            esDueno = true
        }

        comunidad.fotoSegura = '/img/avatar.webp';
        if (comunidad.foto_comunidad && comunidad.foto_comunidad !== '/img/avatar.webp' && comunidad.foto_comunidad !== '/img/default-comunidad.webp') {
            comunidad.fotoSegura = comunidad.foto_comunidad
        }

        const tienePortada = comunidad.fotoSegura !== '/img/avatar.webp'

        res.render('pages/info-comunidad', {
            comunidad: comunidad,
            miembros: miembros,
            esDueno: esDueno,
            tienePortada: tienePortada
        })

    } catch (error) {
        req.flash('error', 'No se pudo cargar la información de la comunidad')
        return res.redirect(`/comunidades/${idComunidad}/chat`)
    }
}

exports.expulsarMiembroComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo
    const idComunidad = req.params.id
    const usuario_id = req.body.usuario_id

    try {
        await comunidadApi.expulsarMiembro(idComunidad, usuario_id, token)
        sse.emitirEvento(idComunidad, 'usuario_expulsado', { idExpulsado: usuario_id });
        req.flash('exito', 'Miembro expulsado de la comunidad')

    } catch (error) {

        const mensajeError = mensajesBakend.extraerMensajeError(error)
        req.flash('error', mensajeError || 'Error al expulsar al miembro')
    }
    return res.redirect(`/comunidades/${idComunidad}/info`)
}

exports.transferirPropiedadComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo
    const idComunidad = req.params.id
    const nuevo_dueno_id = req.body.nuevo_dueno_id

    try {
        await comunidadApi.transferirPropiedad(idComunidad, nuevo_dueno_id, token)
        req.flash('exito', 'Has transferido la propiedad de la comunidad exitosamente')
        
    } catch (error) {
        const mensajeError = mensajesBakend.extraerMensajeError(error)
        req.flash('error', mensajeError || 'Error al transferir la propiedad')
    }
    return res.redirect(`/comunidades/${idComunidad}/info`)
}


exports.enviarMensajeChat = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idComunidad = req.params.id;

    if (!token) return res.status(401).json({ error: 'Debes iniciar sesión' });

    try {
        if (req.files && req.files.length > 4) {
            return res.status(400).json({ error: 'limite_archivos', mensaje: 'No puedes subir más de 4 archivos.' });
        }

        const limiteMB = 60 * 1024 * 1024;
        if (req.files) {
            let j = 0;
            while (j < req.files.length) {
                if (req.files[j].size > limiteMB) {
                    return res.status(400).json({ error: 'peso_excedido', mensaje: 'Un archivo supera los 60MB.' });
                }
                j++;
            }
        }

        let datosMensaje = {
            contenido: req.body.contenido || "",
            comunidad: idComunidad,
            archivos: []
        };

        if (req.body.mensaje_respondido) {
            datosMensaje.mensaje_respondido = req.body.mensaje_respondido;
        }

        if (req.files && req.files.length > 0) {
            let i = 0;
            while (i < req.files.length) {
                const archivo = req.files[i];
                const urlSegura = await cloudinary.subirArchivoCloudinary(archivo, 'chat', false);
                
                let tipoMedia = 'imagen';
                if (archivo.mimetype && archivo.mimetype.includes('video')) tipoMedia = 'video';
                
                datosMensaje.archivos.push({ url_media: urlSegura, tipo_media: tipoMedia });
                i++;
            }
        }
        
        const respuesta = await comunidadApi.enviarMensaje(datosMensaje, token);
        const msjEmitido = respuesta.data;
        if (datosMensaje.archivos.length > 0 && (!msjEmitido.archivos || msjEmitido.archivos.length === 0)) {
            msjEmitido.archivos = datosMensaje.archivos;
        }
        sse.emitirEvento(idComunidad, 'nuevo_mensaje', msjEmitido);
        return res.status(201).json({ exito: true, mensaje: respuesta.data });

    } catch (error) {
        return res.status(400).json({ error: 'servidor', mensaje: 'Error al enviar el mensaje' });
    }
};

exports.eliminarMensajeChat = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idMensaje = req.params.id;
    const idComunidad = req.body.idComunidad;

    if (!token) return res.status(401).json({ error: 'No autorizado' });

    try {
        await comunidadApi.eliminarMensaje(idMensaje, token);
        sse.emitirEvento(idComunidad, 'eliminar_mensaje', { idMensaje });

        return res.status(200).json({ exito: true });

    } catch (error) {
        return res.status(400).json({ error: 'Error al eliminar el mensaje' });
    }
};

exports.editarMensajeChat = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idMensaje = req.params.id;
    const idComunidad = req.body.idComunidad;

    if (!token) return res.status(401).json({ error: 'No autorizado' });

    try {
        const respuesta = await comunidadApi.editarMensaje(idMensaje, { contenido: req.body.contenido }, token);

        sse.emitirEvento(idComunidad, 'editar_mensaje', { idMensaje, nuevoContenido: req.body.contenido });
        return res.status(200).json({ exito: true, mensaje: respuesta.data });

    } catch (error) {
        return res.status(400).json({ error: 'Error al editar el mensaje' });
    }
};
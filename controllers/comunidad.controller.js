const comunidadApi = require('../api/comunidad');
const mensajesBakend = require('../utils/mensajes');
const cloudinary = require('../services/cloudinary');

exports.formatearComunidades = (comunidades, usuarioLogueado) => {
    return comunidades.map(comunidad => {
        let esDueno = false;
        if (usuarioLogueado && comunidad.usuario) {
            esDueno = (usuarioLogueado.nombre_usuario === comunidad.usuario.nombre_usuario);
        }

        return {
            ...comunidad,
            esDueno: esDueno,
            fotoSegura: comunidad.foto_comunidad || '/img/avatar.webp',
            totalMiembros: comunidad.total_miembros || 0
        };
    });
};

exports.mostrarComunidades = async (req, res) => {
    const token = req.cookies.jwt_echo;
    

    const params = {
        page: 1,
        categoria: req.query.categoria || '',
        buscar: req.query.buscar || '',
        unidas: req.query.unidas || '',
        seccionBuscar: req.query.seccionBuscar || ''
    };

    Object.keys(params).forEach(key => !params[key] && delete params[key]);

    try {
        const respuesta = await comunidadApi.listarComunidades(params, token);
        const comunidadesFormateadas = exports.formatearComunidades(respuesta.data.results || [], res.locals.usuarioLogueado);

        res.render('pages/comunidades', {
            comunidades: comunidadesFormateadas,
            tieneSiguiente: respuesta.data.next ? true : false,
            filtrosActuales: params, 
            error: req.query.error || null,
            exito: req.query.exito || null
        });

    } catch (error) {
        res.render('pages/comunidades', {
            comunidades: [],
            tieneSiguiente: false,
            filtrosActuales: params,
            error: 'No se pudieron cargar las comunidades.',
            exito: null
        });
    }
};


exports.cargarMasComunidades = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const params = {
        page: req.query.page || 2,
        categoria: req.query.categoria || '',
        buscar: req.query.buscar || '',
        unidas: req.query.unidas || '',
        usuario: req.query.usuario || '' 
    };

    Object.keys(params).forEach(key => !params[key] && delete params[key]);

    try {
        const respuesta = await comunidadApi.listarComunidades(params, token);
        const comunidadesFormateadas = exports.formatearComunidades(respuesta.data.results || [], res.locals.usuarioLogueado);

        
        res.render('partials/solo-tarjetas-comunidad', { 
            comunidades: comunidadesFormateadas,
            filtrosActuales: params 
        }, (err, html) => {
            if (err) return res.status(500).json({ error: 'Error de renderizado' });
            res.json({ html: html, tieneSiguiente: respuesta.data.next ? true : false });
        });

    } catch (error) {
        res.status(500).json({ error: 'No se pudieron cargar más comunidades' });
    }
};

exports.mostrarCrearComunidad = (req, res) => {
    token = req.cookies.jwt_echo

    if (!token){
        return res.redirect('/login?error=Debes iniciar sesión para crear una comunidad')
        
    }
    res.render('pages/crear-comunidad', {
        modo: 'crear',
        comunidad: null,
        error: req.query.error || null
    });
};

exports.crearComunidad = async (req, res) => {

    const token = req.cookies.jwt_echo
    if (!token){
        return res.redirect('/login?error=Debes iniciar sesión');
    } 

    try {
        let datosComunidad = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion || "",
            categoria: req.body.categoria
        };

        if (req.files && req.files.length > 0) {
            const archivoImagen = req.files[0];
            const urlSegura = await cloudinary.subirArchivoCloudinary(archivoImagen, 'comunidades', false);
            datosComunidad.foto_comunidad = urlSegura;
        }

        const respuesta = await comunidadApi.crearComunidad(datosComunidad, token);
        return res.redirect(`/comunidades?exito=Comunidad creada exitosamente`);

    } catch (error) {
        const dataError = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(dataError);
        return res.redirect(`/comunidades/crear?error=${encodeURIComponent(resultado.mensaje)}`);
    }
};

exports.mostrarEditarComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idComunidad = req.params.id;

    if (!token) return res.redirect('/login?error=Debes iniciar sesión');

    try {
        const respuesta = await comunidadApi.obtenerComunidad(idComunidad, token);
        const comunidad = respuesta.data;

        if (comunidad.usuario.nombre_usuario !== res.locals.usuarioLogueado.nombre_usuario) {
            return res.redirect('/comunidades?error=No tienes permiso para editar esta comunidad');
        }

        res.render('pages/crear-comunidad', {
            modo: 'editar',
            comunidad: comunidad,
            error: req.query.error || null
        });
    } catch (error) {
        return res.redirect('/comunidades?error=No se pudo cargar la comunidad');
    }
};

exports.editarComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idComunidad = req.params.id;

    if (!token) return res.redirect('/login');

    try {
        let datosEditados = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            categoria: req.body.categoria
        };

        if (req.body.quitar_foto === 'true') {
            datosEditados.foto_comunidad = ''; 
        }

        if (req.files && req.files.length > 0) {
            const archivoImagen = req.files[0];
            const urlSegura = await cloudinary.subirArchivoCloudinary(archivoImagen, 'comunidades', false);
            datosEditados.foto_comunidad = urlSegura;
        }
        

        await comunidadApi.editarComunidad(idComunidad, datosEditados, token);
        return res.redirect(`/comunidades?exito=Comunidad actualizada correctamente`);

    } catch (error) {
        const dataError = error.response ? error.response.data : error;
        const resultado = mensajesBakend.normalizarRespuestaBackend(dataError);
        return res.redirect(`/comunidades/${idComunidad}/editar?error=${encodeURIComponent(resultado.mensaje)}`);
    }
};

exports.eliminarComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idComunidad = req.params.id;

    if (!token){
        return res.redirect('/login?error=Debes iniciar sesión');
    } 

    try {
        await comunidadApi.eliminarComunidad(idComunidad, token)
        return res.redirect('/comunidades?exito=Comunidad eliminada exitosamente')

    } catch (error) {
        return res.redirect(`/comunidades/${idComunidad}/editar?error=Error al eliminar la comunidad`);
    }
};


exports.unirseOAbandonarComunidad = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idComunidad = req.params.id;

    if (!token){
        return res.redirect('/login?error=Debes iniciar sesión');
    } 

    try {

        const respuesta = await comunidadApi.unirseOAbandonar(idComunidad, token);
        
        let mensajeExito = 'Membresía actualizada';
        
        if (respuesta.status === 201) {
            mensajeExito = 'Te has unido a la comunidad exitosamente';
        } 

        else if (respuesta.status === 204) {
            mensajeExito = 'Has abandonado la comunidad';
        }

        return res.redirect(`/comunidades?exito=${encodeURIComponent(mensajeExito)}`);

    } catch (error) {

        return res.redirect('/comunidades?error=hubo un error en algo');
    }
};

exports.mostrarChat = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const idComunidad = req.params.id;

    if (!token){
        return res.redirect('/login?error=Debes iniciar sesión');
    }

    try {
        const respuesta = await comunidadApi.obtenerComunidad(idComunidad, token);
        const comunidad = respuesta.data;

        const esDueno = res.locals.usuarioLogueado && comunidad.usuario.nombre_usuario === res.locals.usuarioLogueado.nombre_usuario;
        const estoyUnido = comunidad.estoy_unido || esDueno; 

        res.render('pages/chat-comunidad', {
            comunidad: {
                ...comunidad,
                fotoSegura: comunidad.foto_comunidad || '/img/avatar.webp'
            },
            esDueno,
            estoyUnido
        });
    } catch (error) {
        return res.redirect('/comunidades?error=No se pudo cargar el chat');
    }
};
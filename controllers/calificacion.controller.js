const calificacionApi = require('../api/calificacion')
const mensajesBakend = require('../utils/mensajes')

exports.procesarCalificacion = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const usuarioCalificado = req.params.nombre_usuario
    const rutaDestino = `/perfil/${usuarioCalificado}?seccion=calificaciones`

    if (!token) {
        req.flash('error', 'Debes iniciar sesión para calificar')
        return res.redirect('/login')
    }

    try {
        await calificacionApi.crearCalificacion({
            puntuacion: req.body.puntuacion,
            descripcion: req.body.descripcion,
            usuario_calificado: req.body.usuario_calificado_id 
        }, token)
        
        req.flash('exito', 'Calificación registrada correctamente')
        return res.redirect(rutaDestino)

    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response || error)
        req.flash('error', resultado.mensaje)
        return res.redirect(rutaDestino)
    }
}

exports.eliminarCalificacion = async (req, res) => {
    const { nombre_usuario, id } = req.params
    try {
        await calificacionApi.eliminarCalificacion(id, req.cookies.jwt_echo)
        req.flash('exito', 'Reseña eliminada');
    } catch (error) {
        req.flash('error', 'No se pudo eliminar la reseña')
    }
    return res.redirect(`/perfil/${nombre_usuario}?seccion=calificaciones`)
}

exports.editarCalificacion = async (req, res) => {
    const token = req.cookies.jwt_echo;
    const { nombre_usuario, id } = req.params;
    const rutaDestino = `/perfil/${nombre_usuario}?seccion=calificaciones`

    // Validación de usuario logueado
    if (!token) {
        req.flash('error', 'Debes iniciar sesión para editar una reseña')
        return res.redirect('/login')
    }

    try {
        await calificacionApi.editarCalificacion(id, {
            puntuacion: req.body.puntuacion,
            descripcion: req.body.descripcion
        }, token)
        
        req.flash('exito', 'Reseña actualizada correctamente')
        return res.redirect(rutaDestino)

    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response || error)
        req.flash('error', resultado.mensaje)
        return res.redirect(rutaDestino)
    }
}
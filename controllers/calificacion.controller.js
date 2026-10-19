const calificacionApi = require('../api/calificacion'); 
const mensajesBakend = require('../utils/mensajes');

exports.procesarCalificacion = async (req, res) => {
    
    const token = req.cookies.jwt_echo;

    if (!token) {
        return res.redirect('/login?error=Debes iniciar sesión para calificar a un usuario');
    }

    const usuarioCalificado = req.params.nombre_usuario; 
    const cuerpito = {
        puntuacion: req.body.puntuacion,
        descripcion: req.body.descripcion,
        usuario_calificado: usuarioCalificado 
    };

    try {
        const respuesta = await calificacionApi.crearCalificacion(cuerpito, token);
        
        return res.redirect(`/perfil/${usuarioCalificado}?exito=Calificación enviada correctamente`);

    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response);
        
        return res.redirect(`/perfil/${usuarioCalificado}?error=${resultado.mensaje}`);
    }
};

exports.editarCalificacion = async (req, res) => {
    const token = req.cookies.jwt_echo;

    if (!token) {
        return res.redirect('/login?error=Debes iniciar sesión para editar una reseña');
    }

    const { nombre_usuario, calificacionId } = req.params;
    const puntuacion = req.body.puntuacion ?? req.body.puntuacion_editar ?? null;
    const cuerpito = {
        puntuacion,
        descripcion: req.body.descripcion,
    };

    try {
        await calificacionApi.editarCalificacion(calificacionId, cuerpito, token);
        return res.redirect(`/perfil/${nombre_usuario}?seccion=calificaciones&exito=Reseña actualizada correctamente`);
    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response);
        return res.redirect(`/perfil/${nombre_usuario}?seccion=calificaciones&error=${encodeURIComponent(resultado.mensaje)}`);
    }
};

exports.eliminarCalificacion = async (req, res) => {
    const token = req.cookies.jwt_echo;

    if (!token) {
        return res.redirect('/login?error=Debes iniciar sesión para eliminar una reseña');
    }

    const { nombre_usuario, calificacionId } = req.params;

    try {
        await calificacionApi.eliminarCalificacion(calificacionId, token);
        return res.redirect(`/perfil/${nombre_usuario}?seccion=calificaciones&exito=Reseña eliminada correctamente`);
    } catch (error) {
        const resultado = mensajesBakend.normalizarRespuestaBackend(error.response);
        return res.redirect(`/perfil/${nombre_usuario}?seccion=calificaciones&error=${encodeURIComponent(resultado.mensaje)}`);
    }
};
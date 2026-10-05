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
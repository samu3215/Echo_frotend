const api = require('../config/axios.config');

const envioToken = (token) => {
    return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
};

exports.crearPublicacion = async (datos, token) => {
    return await api.post('/publicaciones/', datos, envioToken(token));
};

exports.editarPublicacion = async (id, datos, token) => {
    return await api.patch(`/publicaciones/${id}/`, datos, envioToken(token));
};

exports.obtenerPublicacion = async (id, token = null) => {
    return await api.get(`/publicaciones/${id}/`, envioToken(token));
};

exports.eliminarPublicacion = async (id, token) => {
    return await api.delete(`/publicaciones/${id}/`, envioToken(token));
};

exports.listarPublicaciones = async (pagina = 1, token = null) => {
    return await api.get(`/publicaciones/?page=${pagina}`, envioToken(token));
};

exports.listarPublicacionesUsuario = async (nombreUsuario, pagina = 1, token = null) => {
    return await api.get(`/publicaciones/?usuario=${nombreUsuario}&page=${pagina}`, envioToken(token));
};

exports.listarPublicacionesLikesUsuario = async (nombreUsuario, pagina = 1, token = null) => {
    return await api.get(`/publicaciones/?like=${nombreUsuario}&page=${pagina}`, envioToken(token));
};

exports.darLike = async (id, token) => {
    return await api.post(`/publicaciones/${id}/like/`, {}, envioToken(token));
};

exports.crearComentario = async (datos, token) => {
    return await api.post('/comentarios/', datos, envioToken(token));
};

exports.editarComentario = async (id, datos, token) => {
    return await api.patch(`/comentarios/${id}/`, datos, envioToken(token));
};

exports.eliminarComentario = async (id, token) => {
    return await api.delete(`/comentarios/${id}/`, envioToken(token));
};
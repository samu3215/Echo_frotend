const api = require('../config/axios.config');

const envioToken = (token) => (token ? { headers: { 'Authorization': `Bearer ${token}` } } : {});

exports.crearCalificacion = async (datos, token) => {
    return await api.post('/calificaciones/', datos, envioToken(token));
};

exports.eliminarCalificacion = async (id, token) => {
    return await api.delete(`/calificaciones/${id}/`, envioToken(token));
};

exports.editarCalificacion = async (id, datos, token) => {
    return await api.patch(`/calificaciones/${id}/`, datos, envioToken(token));
};
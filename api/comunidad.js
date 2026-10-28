const api = require('../config/axios.config')

const envioToken = (token) => {
    return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
}

exports.listarComunidades = async (params = {}, token = null) => {
    const queryParams = new URLSearchParams(params).toString()
    return await api.get(`/comunidades/?${queryParams}`, envioToken(token))
}

exports.obtenerComunidad = async (id, token = null) => {
    return await api.get(`/comunidades/${id}/`, envioToken(token))
}

exports.crearComunidad = async (datos, token) => {
    return await api.post('/comunidades/', datos, envioToken(token))
}

exports.unirseOAbandonar = async (id, token) => {
    return await api.post(`/comunidades/${id}/miembro/`, {}, envioToken(token))
}

exports.editarComunidad = async (id, datos, token) => {
    return await api.patch(`/comunidades/${id}/`, datos, envioToken(token))
}

exports.eliminarComunidad = async (id, token) => {
    return await api.delete(`/comunidades/${id}/`, envioToken(token))
}

exports.listarMiembros = async (id, token = null) => {
    return await api.get(`/comunidades/${id}/miembros/`, envioToken(token))
}

exports.expulsarMiembro = async (id, usuarioId, token) => {
    return await api.post(`/comunidades/${id}/expulsar/`, { usuario_id: usuarioId }, envioToken(token))
}
    
exports.transferirPropiedad = async (id, nuevoDuenoId, token) => {
    return await api.patch(`/comunidades/${id}/transferir-propiedad/`, { nuevo_dueno_id: nuevoDuenoId }, envioToken(token))
}

exports.listarMensajes = async (idComunidad, page = 1, token = null) => {
    return await api.get(`/mensajes-comunidad/?comunidad=${idComunidad}&page=${page}`, envioToken(token))
}

exports.enviarMensaje = async (datosMensaje, token) => {
    return await api.post(`/mensajes-comunidad/`, datosMensaje, envioToken(token))
}
exports.eliminarMensaje = async (idMensaje, token) => {
    return await api.delete(`/mensajes-comunidad/${idMensaje}/`, envioToken(token))
}

exports.editarMensaje = async (idMensaje, datos, token) => {
    return await api.patch(`/mensajes-comunidad/${idMensaje}/`, datos, envioToken(token))
}
const api = require('../config/axios.config')

const envioToken = (token) => {
    return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
}

exports.crearUsuario = async (datos) => {
    return await api.post('/usuarios/', datos)
}

exports.listarUsuarios = async (token = null) => {
    const respuesta = await api.get('/usuarios/', envioToken(token) )
    return respuesta.data
     
}
exports.loginUsuario = async (credenciales) => {
    return await api.post('/login/', credenciales)
}


exports.listarUsuario = async(nombreUsuario, token = null )=>{
    const respuesta = await api.get(`/usuarios/${nombreUsuario}/`,envioToken(token))
    return respuesta.data;
}

exports.actualizarUsuario = async (nombreUsuario, datos, token) => {
    const respuesta = await api.patch(`/usuarios/${nombreUsuario}/`, datos, envioToken(token))
    return respuesta.data;
}


exports.eliminarUsuarios = async (nombreUsuario, token) => {
    const respuesta = await api.delete(`/usuarios/${nombreUsuario}/`, envioToken(token))
    return respuesta.data
}

exports.seguirUsuario = async (nombreUsuario, token) => {
    const respuesta = await api.post(`/usuarios/${nombreUsuario}/seguir/`, {}, envioToken(token))
    return respuesta.data;
}

exports.obtenerNotificaciones = async (token) => {
    const respuesta = await api.get('/usuarios/notificaciones/', envioToken(token))
    return respuesta.data;
}

exports.marcarNotificacionesLeidas = async (token) => {
    const respuesta = await api.post('/usuarios/marcar-notificaciones/', {}, envioToken(token))
    return respuesta.data;
}

exports.listarSeguidores = async (nombreUsuario, token = null) => {
    const respuesta = await api.get(`/usuarios/${nombreUsuario}/seguidores/`, envioToken(token))
    return respuesta.data;
}

exports.listarSeguidos = async (nombreUsuario, token = null) => {
    const respuesta = await api.get(`/usuarios/${nombreUsuario}/seguidos/`, envioToken(token))
    return respuesta.data;
}
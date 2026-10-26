const api = require('../config/axios.config');

const envioToken = (token) => ({ headers: { 'Authorization': `Bearer ${token}` } });

exports.crearUsuario = async (datos) => {
    return await api.post('/usuarios/', datos);
};

exports.listarUsuarios = async (token = null) => {
    const respuesta = await api.get('/usuarios/', token ? { headers: { 'Authorization': `Bearer ${token}` } } : {});
    return respuesta.data;
     
}
exports.loginUsuario = async (credenciales) => {
    return await api.post('/login/', credenciales);
};

exports.listarUsuario = async (nombreUsuario, token = null) => {
    const respuesta = await api.get(`/usuarios/${nombreUsuario}/`, envioToken(token));
    return respuesta.data;
};

exports.eliminarUsuarios = async (nombreUsuario, token) => {
    const respuesta = await api.delete(`/usuarios/${nombreUsuario}/`, envioToken(token))
    return respuesta.data
}

exports.seguirUsuario = async (nombreUsuario, token) => {
    const respuesta = await api.post(`/usuarios/${nombreUsuario}/seguir/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return respuesta.data;
};

exports.obtenerNotificaciones = async (token) => {
    const respuesta = await api.get('/usuarios/notificaciones/', envioToken(token));
    return respuesta.data;
};
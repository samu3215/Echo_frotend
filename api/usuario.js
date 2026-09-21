const api = require('../config/axios.config');

const envioToken = (token) => ({ headers: { 'Authorization': `Bearer ${token}` } });

exports.crearUsuario = async (datos) => {
    return await api.post('/usuarios/', datos);
};

exports.listarUsuarios = async () => {
    const respuesta = await api.get('/usuarios/')
    return respuesta.data
     
}
exports.loginUsuario = async (credenciales) => {
    return await api.post('/login/', credenciales);
};



exports.listarUsuario = async(nombreUsuario)=>{
    const respuesta = await api.get(`/usuarios/${nombreUsuario}/`);
    return respuesta.data;
}

exports.actualizarUsuario = async (nombreUsuario, datos, token) => {
    const respuesta = await api.patch(`/usuarios/${nombreUsuario}/`, datos, envioToken(token));
    return respuesta.data;
};


exports.eliminarUsuarios = async (nombreUsuario, token) => {
    const respuesta = await api.delete(`/usuarios/${nombreUsuario}/`, envioToken(token))
    return respuesta.data
}


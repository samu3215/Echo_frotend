const api = require('../config/axios.config');

exports.crearUsuario = async (datos) => {
    return await api.post('/usuarios/', datos);
};

exports.loginUsuario = async (credenciales) => {
    return await api.post('/login/', credenciales);
};


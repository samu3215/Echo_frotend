const api = require('../config/axios.config');

const crearUsuario = async (datos) => {
    return await api.post('/usuarios/', datos);
};

const loginUsuario = async (credenciales) => {
    return await api.post('/login/', credenciales);
};

module.exports = { crearUsuario, loginUsuario };
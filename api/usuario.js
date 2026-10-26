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

exports.solicitarCodigoRecuperacion = async (email) => {
    try {
        const respuesta = await api.post('recuperacion/solicitar-codigo/', { email }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return respuesta.data;
    } catch (error) {
        console.error('Falló POST de solicitud de código a Django.', {
            baseURL: error.config && error.config.baseURL,
            url: error.config && error.config.url,
            method: error.config && error.config.method,
            code: error.code,
            status: error.response && error.response.status,
            message: error.message
        });
        throw error;
    }
};

exports.verificarCodigoRecuperacion = async (email, codigo) => {
    const respuesta = await api.post('/recuperacion/verificar-codigo/', { email, codigo });
    return respuesta.data;
};

exports.restablecerContrasena = async (token, datos) => {
    const respuesta = await api.post('/recuperacion/restablecer-contrasena/', datos, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
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

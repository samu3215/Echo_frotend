const usuarioApi = require('../api/usuario');

exports.solicitarCodigo = async (req, res) => {
    try {
        const data = await usuarioApi.solicitarCodigoRecuperacion(req.body.email);
        return res.json(data);
    } catch (error) {
        console.log("ERROR REAL DE AXIOS:", error.message, error.response?.status, error.config?.url);
        return res.status(400).json({ error: error.response?.data?.error || 'Error al solicitar el código' })
    }
};

exports.verificarCodigo = async (req, res) => {
    try {
        const data = await usuarioApi.verificarCodigoRecuperacion(req.body.email, req.body.codigo);
    
        return res.json({
            exito: true,
            token: data.token || data.access_token || data.temp_token
        });
    } catch (error) {
        return res.status(400).json({ error: error.response?.data?.error || 'Código inválido o expirado' });
    }
};

exports.restablecerContrasena = async (req, res) => {
    try {
        const data = await usuarioApi.restablecerContrasena(req.body.token, {
            password: req.body.password,
            confirmar_password: req.body.confirmar_password
        });
        
        return res.json({ exito: true, mensaje: data.mensaje });
    } catch (error) {
        return res.status(400).json({ error: error.response?.data?.error || 'La verificación expiró. Solicita un nuevo código.' });
    }
};
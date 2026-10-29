const usuarioApi = require('../api/usuario');

exports.solicitarCodigo = async (req, res) => {
    try {
        // Llama a la API de Django que definiste en usuario.js
        const data = await usuarioApi.solicitarCodigoRecuperacion(req.body.email);
        return res.json(data);
    } catch (error) {
        return res.status(400).json({ error: error.response?.data?.error || 'Error al solicitar el código' });
    }
};

exports.verificarCodigo = async (req, res) => {
    try {
        const data = await usuarioApi.verificarCodigoRecuperacion(req.body.email, req.body.codigo);
        
        // AQUÍ ESTÁ LA MAGIA QUE SOLUCIONA EL ERROR:
        // Le pasamos explícitamente el token al frontend para que lo guarde.
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
        // Enviamos el token en la cabecera (como lo pide usuario.js) y las contraseñas en el body
        const data = await usuarioApi.restablecerContrasena(req.body.token, {
            password: req.body.password,
            confirmar_password: req.body.confirmar_password
        });
        
        return res.json({ exito: true, mensaje: data.mensaje });
    } catch (error) {
        return res.status(400).json({ error: error.response?.data?.error || 'La verificación expiró. Solicita un nuevo código.' });
    }
};
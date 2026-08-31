const usuarioApi = require('../api/usuario');

const mostrarInicio = (req, res) => {
    res.render('pages/inicio')
}

const selecFormulario = (req, res) => {
    res.render('pages/registro'); 
};

const mostrarFormulario = (req, res) => {
    const tipo = req.params.tipo;
    
    if (tipo !== 'usu' && tipo !== 'empres') {
        return res.redirect('/');
    }

    res.render('pages/formulario', { tipo, error: null });
};

const procesarRegistro = async (req, res) => {
    const payload = req.body;
    
    // Convertimos el tipo de la URL al formato exacto que pide el backend
    payload.tipo_usuario = payload.tipo_url === 'usu' ? 'normal' : 'empresarial';

    try {
        await usuarioApi.crearUsuario(payload);
        res.redirect('/login');

    } catch (error) {
        // Extraer mensajes de error del backend si existen
        const mensajeError = error.response?.data ? JSON.stringify(error.response.data) : 'Error en el registro';
        
        res.render('pages/formulario', { 
            tipo: payload.tipo_url, 
            error: mensajeError 
        });
    }
};


const mostrarLogin = (req, res) => {
    res.render('pages/login', { error: null });
};

const procesarLogin = async (req, res) => {
    const credenciales = {
        identificador: req.body.nombre_usuario, 
        password: req.body.password
    };

    try {

        const respuesta = await usuarioApi.loginUsuario(credenciales);
        const token = respuesta.data.token;

        res.cookie('jwt_echo', token, {
            httpOnly: true, // Evita que scripts maliciosos lean el token
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 24 * 60 * 60 * 1000 // Expira en 1 día (igual que tu backend)
        });
   
        res.redirect('/inicio'); 

    } catch (error) {
        // Extraemos el mensaje de error de Django ("Credenciales inválidas" o "Cuenta desactivada")
        const mensajeError = error.response?.data?.error || 'Error al intentar iniciar sesión.';     
        res.render('pages/login', { error: mensajeError });
    }
};

module.exports = { selecFormulario, mostrarFormulario, procesarRegistro, mostrarLogin, procesarLogin, mostrarInicio };
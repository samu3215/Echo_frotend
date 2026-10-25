const axios = require('axios');

exports.mostrarConfiguracion = async (req, res) => {
    try {
        // 1. Obtener el Token de autenticación de las cookies o headers
        const token = req.cookies.token || req.session.token; 

        // 2. Hacer la petición GET al backend de Django
        const respuestaDjango = await axios.get('http://127.0.0.1:8000/api/usuarios/me/', {
            headers: {
                'Authorization': `Bearer ${token}` // o Token ${token} según tu auth en Django
            }
        });

        // 3. Pasar el objeto de datos de Django a la vista EJS
        res.render('pages/configuracion', {
            usuarioLogueado: respuestaDjango.data,
            exito: req.query.exito || null,
            error: req.query.error || null
        });

    } catch (error) {
        console.error('Error al conectar con el backend de Django:', error.message);
        res.redirect('/inicio');
    }
};
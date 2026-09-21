const usuarioApi = require('../api/usuario');

exports.mostrarInicio = (req, res) => {
    const error = req.query.error || null;
    const exito = req.query.exito || null;

    res.render('pages/inicio', {
        exito,
        error
    });
};

exports.mostrarBusqueda = async (req, res) => {

    try {

        const seccion = req.query.seccion || 'publicaciones';

        const listUsuarios = await usuarioApi.listarUsuarios()

        const usuarios = listUsuarios.filter(u => u.tipo_usuario === 'normal');
        const negocios = listUsuarios.filter(u => u.tipo_usuario === 'empresarial');

        res.render('pages/buscar', {
            seccion: seccion,
            usuarios: usuarios,     
            comunidades: [],  
            publicaciones: [],      
            negocios: negocios,
            error: null
        })
    
    }
    catch (error){

        res.render('pages/buscar', {
            secciones: req.query.seccion || 'publicaciones',
            publicaciones: [],
            usuarios: [],
            comunidades: [],
            negocios: [],
            error: 'no se pudieron cargar los datos',
        })
    
    }
    ;
};

exports.mostrarCreacionPublicaciones = (req, res) => {
    res.render('pages/crear');
};

exports.mostrarNotificaciones = (req, res) => {
    res.render('pages/notificaciones');
};


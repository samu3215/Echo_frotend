const usuarioApi = require('../api/usuario');
const publicacionApi = require('../api/publicaciones')
const mensajesBakend = require('../utils/mensajes');

exports.mostrarPerfil = async (req, res) => {
    const nombreUsu = req.params.nombre_usuario

    try{
        const usuarioPerfil = await usuarioApi.listarUsuario(nombreUsu)
        const seccion = req.query.seccion || 'publicaciones';

        res.render('pages/perfil', {
            usuarioPerfil,
            seccion: seccion,
            exito: req.query.exito || null, 
            error: req.query.error || null
        });

    }catch(error){
        res.render('pages/perfil',{
            error: 'el usuario solicitado no existe'
        })
    }
    
};

exports.actualizarPerfil = async (req,res) =>{
    const nombreUsuActual = req.params.nombre_usuario
    const cuerpito = req.body
    const token = req.cookies.jwt_echo

    if (!token) {
        return res.redirect(`/login?error=Debes iniciar sesión para editar tu perfil`);
    }

    try{

        if (!cuerpito.password) {
            delete cuerpito.password;
            delete cuerpito.confirmar_password;
        }

        if(req.file){
            const respuestaMultimedia = await publicacionApi.subirArchivo(req.file, 'perfiles')
            cuerpito.foto_perfil = respuestaMultimedia.data.url
        }

        await usuarioApi.actualizarUsuario(nombreUsuActual, cuerpito, token)

        const nuevoNombre = cuerpito.nombre_usuario || nombreUsuActual

        return res.redirect(`/perfil/${nuevoNombre}?exito=Perfil actualizado con éxito`)


    }catch(error) {
        console.error("Error en actualizarPerfil:", error.response?.data || error.message);
        const mensaje = error.response?.data?.detail || error.response?.data?.error || 'Ocurrió un error';
        return res.redirect(`/perfil/${nombreUsuActual}?error=${mensaje}`);
    }
}


const express = require('express')
const router = express.Router()
const formularioController = require('../controllers/formulario.controller')
const usuarioController = require('../controllers/usuario.controller');
const publicacionController = require('../controllers/publicacion.controller')
const comunidadController = require('../controllers/comunidad.controller')
const cargarArchivo = require('../middlewares/subir')
const sse = require('../utils/sse')

// routes formulario y login
router.get('/formulario', formularioController.selecFormulario)
router.get('/registro/:tipo', formularioController.mostrarFormulario)
router.post('/registro', cargarArchivo.single('foto_perfil'), formularioController.procesarRegistro);
router.get('/login', formularioController.mostrarLogin)
router.post('/login', formularioController.procesarLogin)

// routes  usuarios

router.get('/perfil/:nombre_usuario', usuarioController.mostrarPerfil)
router.post('/perfil/:nombre_usuario', cargarArchivo.single('foto_perfil'), usuarioController.actualizarPerfil)
router.get('/configuracion/', usuarioController.mostrarConfiguracion)
router.post('/logout/', usuarioController.cerrarSesion)
router.post('/eliminar-cuenta', usuarioController.eliminarUsuario)

// routes publicaciones

router.get('/inicio', publicacionController.mostrarInicio)
router.get('/buscar', publicacionController.mostrarBusqueda)


router.get('/crear', publicacionController.mostrarCreacionPublicaciones)
router.post('/publicaciones/crear', cargarArchivo.array('archivos', 8), publicacionController.crearPublicacion)
router.get('/editar/:id', publicacionController.mostrarEditar)
router.post('/editar/:id', publicacionController.editarPublicacion)
router.post('/publicaciones/eliminar/:id', publicacionController.eliminarPublicacion)


// acciones de publicaciones
router.post('/publicaciones/:id/like', publicacionController.darLike)
router.get('/cargar-mas-publicaciones', publicacionController.cargarMasPublicaciones)
router.post('/publicaciones/:id/comentar', publicacionController.crearComentario)
router.patch('/publicaciones/comentarios/editar/:id', publicacionController.editarComentario)
router.delete('/publicaciones/comentarios/eliminar/:id', publicacionController.eliminarComentario)

router.get('/notificaciones', publicacionController.mostrarNotificaciones)
const express = require('express');
const router = express.Router();
const formularioController = require('../controllers/formulario.controller');
const usuarioController = require('../controllers/usuario.controller');
const publicacionController = require('../controllers/publicacion.controller');
const comunidadController = require('../controllers/comunidad.controller');
const cargarArchivo = require('../middlewares/subir');

router.get('/', formularioController.selecFormulario);
router.get('/registro/:tipo', formularioController.mostrarFormulario);
router.post('/registro/verificar-disponibilidad', formularioController.verificarDisponibilidadRegistro);
router.post('/registro', cargarArchivo.single('foto_perfil'), formularioController.validarAceptacionTerminos, formularioController.procesarRegistro);
router.get('/login', formularioController.mostrarLogin);
router.post('/login', formularioController.procesarLogin);
router.get('/cambio-contrasena', formularioController.mostrarCambioContrasena);
router.get('/terminos-y-condiciones', formularioController.mostrarTerminos);
router.post('/cambio-contrasena/solicitar-codigo', formularioController.solicitarCodigoRecuperacion);
router.post('/cambio-contrasena/verificar-codigo', formularioController.verificarCodigoRecuperacion);
router.post('/cambio-contrasena/restablecer', formularioController.restablecerContrasena);

router.get('/perfil/:nombre_usuario', usuarioController.mostrarPerfil);
router.post('/perfil/:nombre_usuario', cargarArchivo.single('foto_perfil'), usuarioController.actualizarPerfil);
router.get('/configuracion/', usuarioController.mostrarConfiguracion);
router.post('/logout/', usuarioController.cerrarSesion);
router.post('/eliminar-cuenta', usuarioController.eliminarUsuario);

router.get('/inicio', publicacionController.mostrarInicio);
router.get('/buscar', publicacionController.mostrarBusqueda);
router.get('/crear', publicacionController.mostrarCreacionPublicaciones);
router.get('/notificaciones', publicacionController.mostrarNotificaciones);

router.get('/comunidades', comunidadController.mostrarComunidades);

// routes comunidades 

router.get('/comunidades', comunidadController.mostrarComunidades)
router.get('/comunidades/cargar-mas', comunidadController.cargarMasComunidades)

router.get('/comunidades/crear', comunidadController.mostrarCrearComunidad)
router.post('/comunidades/crear', cargarArchivo.array('archivos', 1), comunidadController.crearComunidad)
router.get('/comunidades/:id/editar', comunidadController.mostrarEditarComunidad)
router.post('/comunidades/:id/editar', cargarArchivo.array('archivos', 1), comunidadController.editarComunidad)
router.post('/comunidades/:id/eliminar', comunidadController.eliminarComunidad)

router.post('/comunidades/:id/unirse', comunidadController.unirseOAbandonarComunidad)
router.get('/comunidades/:id/chat', comunidadController.mostrarChat)

router.get('/comunidades/:id/info', comunidadController.mostrarInfo)
router.post('/comunidades/:id/expulsar', comunidadController.expulsarMiembroComunidad)
router.post('/comunidades/:id/transferir', comunidadController.transferirPropiedadComunidad)
router.post('/comunidades/:id/mensajes', cargarArchivo.array('archivos', 4), comunidadController.enviarMensajeChat)
router.delete('/mensajes/:id', comunidadController.eliminarMensajeChat)
router.patch('/mensajes/:id', comunidadController.editarMensajeChat)

router.get('/comunidades/:id/stream', (req, res) => {
    sse.suscribirCliente(req, res, req.params.id);
})

router.get('/', (req,res) => {
    res.redirect('/inicio')
});

module.exports = router;
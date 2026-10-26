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



module.exports = router;
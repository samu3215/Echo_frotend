const express = require('express');
const router = express.Router();
const formularioController = require('../controllers/formulario.controllers')
const usuarioController = require('../controllers/usuario.controller');
const publicacionController = require('../controllers/publicacion.controllers')
const comunidadController = require('../controllers/comunidad.controllers')
const cargarArchivo = require('../middlewares/subir')



// routes formulario y login
router.get('/', formularioController.selecFormulario);
router.get('/registro/:tipo', formularioController.mostrarFormulario);
router.post('/registro', cargarArchivo.single('foto_perfil'), formularioController.procesarRegistro);
router.get('/login', formularioController.mostrarLogin);
router.post('/login', formularioController.procesarLogin);

//////


// routes  usuarios

router.get('/perfil/:nombre_usuario', usuarioController.mostrarPerfil)
router.post('/perfil/:nombre_usuario', cargarArchivo.single('foto_perfil'), usuarioController.actualizarPerfil)

//////


// routes publicaciones

router.get('/inicio', publicacionController.mostrarInicio)
router.get('/buscar', publicacionController.mostrarBusqueda)
router.get('/crear', publicacionController.mostrarCreacionPublicaciones)
router.get('/notificaciones', publicacionController.mostrarNotificaciones)

//////


// routes comunidades 
router.get('/comunidades', comunidadController.mostrarComunidades)
//////



module.exports = router;
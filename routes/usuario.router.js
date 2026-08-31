const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

router.get('/', usuarioController.selecFormulario);
router.get('/registro/:tipo', usuarioController.mostrarFormulario);
router.post('/registro', usuarioController.procesarRegistro);
router.get('/login', usuarioController.mostrarLogin);
router.post('/login', usuarioController.procesarLogin);
router.get('/inicio', usuarioController.mostrarInicio)
module.exports = router;
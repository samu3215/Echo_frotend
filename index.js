
// require('dotenv').config()
// const express = require('express')
// const path = require('path')
// const app = express()

// app.set('view engine', 'ejs')

// app.use(express.json())
// app.use(express.urlencoded({extended:false}))
// app.use(express.static(path.join(__dirname, 'public')));


// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// const datosLogueado = require('./middlewares/token')



// app.use((req, res, next) => {
//     res.locals.error = null;
//     res.locals.exito = null;
//     next();
// });

// app.use(datosLogueado.datosUsuarioLogueado)
// console.log(datosLogueado.datosUsuarioLogueado)

// const usuarioRouter = require('./routes/echo.router');
// app.use('/', usuarioRouter);



// const PORT = process.env.PORT || 9999;
// app.listen(PORT, () => {
//     console.log(`Aplicacion en linea en puerto ${PORT}`);
// });


// const router = express.Router();

// // 1. Asegúrate de importar el controlador correctamente
// const usuarioController = require('./controllers/usuario.controller');

// // 2. Verifica que las funciones existan en el objeto importado
// router.get('/perfil/:nombre_usuario', usuarioController.mostrarPerfil);
// router.post('/perfil/:nombre_usuario', usuarioController.actualizarPerfil);

// router.get('/configuracion', usuarioController.mostrarConfiguracion);
// router.post('/configuracion', usuarioController.procesarConfiguracion);

// router.post('/logout', usuarioController.cerrarSesion);
// router.post('/eliminar-cuenta', usuarioController.eliminarUsuario);

// module.exports = router;


require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Limpieza global de variables locales de respuesta
app.use((req, res, next) => {
    res.locals.error = null;
    res.locals.exito = null;
    next();
});

// Middleware de usuario logueado
const datosLogueado = require('./middlewares/token');
app.use(datosLogueado.datosUsuarioLogueado);

// Rutas principales del aplicativo
const usuarioRouter = require('./routes/echo.router');
app.use('/', usuarioRouter);

// Inicio del servidor Express
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`Aplicación en línea en el puerto ${PORT}`);
});
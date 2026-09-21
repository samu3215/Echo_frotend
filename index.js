
require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')));


const cookieParser = require('cookie-parser');
app.use(cookieParser());

const datosLogueado = require('./middlewares/token')



app.use((req, res, next) => {
    res.locals.error = null;
    res.locals.exito = null;
    next();
});

app.use(datosLogueado.datosUsuarioLogueado)
console.log(datosLogueado.datosUsuarioLogueado)

const usuarioRouter = require('./routes/echo.router');
app.use('/', usuarioRouter);



const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`Aplicacion en linea en puerto ${PORT}`);
});
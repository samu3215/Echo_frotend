require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const errorCannotGet = require('./middlewares/errorCannotGet')

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.use(session({
    secret: process.env.SECRET_KEY || 'sdfghjkl123',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 60000, 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true 
    }
}))

app.use(flash())

app.use((req, res, next) => {
    const errorFlash = req.flash('error')
    const exitoFlash = req.flash('exito')
    
    res.locals.error = errorFlash.length > 0 ? errorFlash[0] : null
    res.locals.exito = exitoFlash.length > 0 ? exitoFlash[0] : null
    next()
    
})

const datosLogueado = require('./middlewares/token')

app.use(datosLogueado.datosUsuarioLogueado)

const usuarioRouter = require('./routes/echo.router')

app.use('/', usuarioRouter)
app.use(errorCannotGet.noEncontrado)
app.use(errorCannotGet.errorServidor)


const PORT = process.env.PORT || 9999

app.listen(PORT, () => {
    console.log(`Aplicacion en linea en puerto ${PORT}`)
});
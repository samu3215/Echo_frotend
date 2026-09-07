const multer = require('multer');

const almacenamiento = multer.memoryStorage();
const cargarArchivo = multer({ storage: almacenamiento });

module.exports = cargarArchivo;
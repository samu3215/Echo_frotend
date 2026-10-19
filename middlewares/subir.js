const multer = require('multer');

const almacenamiento = multer.memoryStorage();
const cargarArchivo = multer({ 
    storage: almacenamiento,
    limits: { fileSize: 60 * 1024 * 1024 } // 60 MB en bytes
});

module.exports = cargarArchivo;
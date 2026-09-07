const api = require('../config/axios.config');
const FormData = require('form-data');

exports.subirArchivo = async (archivo, carpeta = 'general') => {
    const formulario = new FormData();
    

    formulario.append('archivo', archivo.buffer, {
        filename: archivo.originalname,
        contentType: archivo.mimetype
    });
    formulario.append('carpeta', carpeta);

    return await api.post('/upload/', formulario, {
        headers: {
            ...formulario.getHeaders()
        }
    });
};
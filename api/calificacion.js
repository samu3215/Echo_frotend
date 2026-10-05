const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

exports.crearCalificacion = async (datos, token) => {
    const respuesta = await axios.post(`${BACKEND_URL}/calificaciones/`, datos, {
        headers: {
            'Authorization': `Bearer ${token}` 
        }
    });
    
    return respuesta;
};
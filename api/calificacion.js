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

exports.editarCalificacion = async (id, datos, token) => {
    const respuesta = await axios.patch(`${BACKEND_URL}/calificaciones/${id}/`, datos, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return respuesta;
};

exports.eliminarCalificacion = async (id, token) => {
    const respuesta = await axios.delete(`${BACKEND_URL}/calificaciones/${id}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return respuesta;
};
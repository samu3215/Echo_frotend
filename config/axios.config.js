const axios = require('axios');

const api = axios.create({
    // Lee la URL de la API desde el archivo .env
    baseURL: process.env.API_URL || 'http://localhost:8000/api/',
    timeout: 5000,
});

module.exports = api;
const axios = require('axios');

const api = axios.create({

    baseURL: process.env.API_URL || 'http://localhost:8000/api/',
    timeout: 5000,
});

module.exports = api;
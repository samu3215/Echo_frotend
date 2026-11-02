const axios = require('axios');

const api = axios.create({

    baseURL: process.env.API_URL || 'https://echo-1-wc02.onrender.com/api/',
    timeout: 60000,
});

module.exports = api;
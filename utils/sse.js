// Archivo: utils/sse.js

// Almacenamos los clientes agrupados por el ID de la comunidad
const clientesConectados = {};

exports.suscribirCliente = (req, res, idComunidad) => {
    // Cabeceras obligatorias para mantener la conexión HTTP abierta
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    if (!clientesConectados[idComunidad]) {
        clientesConectados[idComunidad] = [];
    }

    clientesConectados[idComunidad].push(res);

    // Cuando el usuario cierra la pestaña o pierde internet, lo limpiamos de la memoria
    req.on('close', () => {
        clientesConectados[idComunidad] = clientesConectados[idComunidad].filter(c => c !== res);
        if (clientesConectados[idComunidad].length === 0) {
            delete clientesConectados[idComunidad];
        }
    });
};

exports.emitirEvento = (idComunidad, evento, datos) => {
    if (clientesConectados[idComunidad]) {
        const payload = JSON.stringify({ evento, datos });
        // Escribimos el mensaje en el stream de cada cliente conectado a esa comunidad
        clientesConectados[idComunidad].forEach(cliente => {
            cliente.write(`data: ${payload}\n\n`);
        });
    }
};
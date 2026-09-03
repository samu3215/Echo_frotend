exports.normalizarRespuestaBackend = (respuestaBackend) => {
    if (!respuestaBackend) {
        return { esExito: false, mensaje: 'Error al conectar con el servidor.' };
    }

    const data = respuestaBackend.data || respuestaBackend;

    if (data.mensaje || data.message) {
        return { esExito: true, mensaje: data.mensaje || data.message };
    }
    if (data.error) {
        return { esExito: false, mensaje: data.error };
    }
    if (data.detail) {
        return { esExito: false, mensaje: data.detail };
    }

    if (typeof data === 'object') {
        const mensajesExtraidos = [];

        for (const campo in data) {
            const valor = data[campo];

            if (Array.isArray(valor)) {
                mensajesExtraidos.push(...valor);
            } else if (typeof valor === 'string') {
                mensajesExtraidos.push(valor);
            }
        }

        if (mensajesExtraidos.length > 0) {
            return { esExito: false, mensaje: mensajesExtraidos.join(' ') };
        }
    }

    return { esExito: false, mensaje: 'Ocurrió un error inesperado en la solicitud.' };
};

